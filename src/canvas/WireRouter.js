/**
 * WireRouter.js
 * * A hybrid manager that handles:
 * 1. VISUAL ROUTING: Computes orthogonal paths (Straight/L/Z) avoiding obstacles.
 * 2. LOGICAL VALIDATION: Uses PinDoctor to ensure connections are electrically safe.
 */

// ---------------------------------------------------------------------------
// Geometry Helpers (Collision Detection)
// ---------------------------------------------------------------------------

/** Axis-aligned bounding box of a segment */
function segmentBBox(p1, p2, pad = 4) {
  return {
    minX: Math.min(p1.x, p2.x) - pad,
    maxX: Math.max(p1.x, p2.x) + pad,
    minY: Math.min(p1.y, p2.y) - pad,
    maxY: Math.max(p1.y, p2.y) + pad,
  };
}

/** Do two axis-aligned bounding boxes overlap? */
function bboxOverlap(a, b) {
  return !(a.maxX < b.minX || b.maxX < a.minX || a.maxY < b.minY || b.maxY < a.minY);
}

/** Check if a candidate segment collides with any registered wire segment */
function collidesWithAny(p1, p2, existingSegments) {
  const cand = segmentBBox(p1, p2);
  return existingSegments.some(seg => bboxOverlap(cand, seg));
}

/** Convert an array of waypoints into a flat list of { bbox } segments */
function waypointsToSegments(waypoints) {
  const segs = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    segs.push(segmentBBox(waypoints[i], waypoints[i + 1]));
  }
  return segs;
}

// ---------------------------------------------------------------------------
// WireRouter Class
// ---------------------------------------------------------------------------

export class WireRouter {
  /**
   * @param {PinDoctor} [pinDoctor] - Optional validator instance
   */
  constructor(pinDoctor) {
    // --- Logical State (Connections) ---
    this.pinDoctor = pinDoctor;
    this.wires = []; 

    // --- Visual State (Collision Geometry) ---
    /** @type {Array<{ x: number, y: number }>[][]} – all placed wire paths */
    this.existingWires = [];
    /** Flattened segment bboxes for collision checks */
    this._segments = [];
  }

  // =========================================================================
  // 1. Logical Connection Management & Validation
  // =========================================================================

  /**
   * Create a logical connection and validate it against hardware constraints.
   * Does NOT automatically register visual geometry (call addExistingWire for that).
   */
  async addWire(fromComponent, fromPin, toComponent, toPin, board = 'ESP32') {
    let validationResult = null;

    // ⭐ Validate using PinDoctor if available
    if (this.pinDoctor && toPin.startsWith('GPIO_')) {
      validationResult = await this.pinDoctor.validate(
        fromComponent,
        toPin,
        board
      );
    }

    const wire = {
      id: this.generateWireId(),
      fromComponent: fromComponent.id,
      fromPin: fromPin,
      toComponent: toComponent.id,
      toPin: toPin,
      validation: validationResult,
      timestamp: Date.now()
    };

    this.wires.push(wire);
    return wire;
  }

  generateWireId() {
    return `wire_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getWires() {
    return this.wires;
  }

  // =========================================================================
  // 2. Visual Routing & Collision System
  // =========================================================================

  /** Register a completed wire's path so future routes avoid it */
  addExistingWire(waypoints) {
    if (!waypoints || waypoints.length < 2) return;
    this.existingWires.push(waypoints);
    this._segments.push(...waypointsToSegments(waypoints));
  }

  /**
   * Compute a wire path from `from` to `to`.
   * Returns { waypoints, strategy }
   */
  route(from, to) {
    // 1. Try straight line
    if (!collidesWithAny(from, to, this._segments)) {
      return { waypoints: [from, to], strategy: 'STRAIGHT' };
    }

    // 2. Try L-shape variant A: go horizontal first, then vertical
    const lA = this._tryLShape(from, to, 'horizontal_first');
    if (lA) return lA;

    // 3. Try L-shape variant B: go vertical first, then horizontal
    const lB = this._tryLShape(from, to, 'vertical_first');
    if (lB) return lB;

    // 4. Fall back to Z-shape (always succeeds geometrically)
    return this._zShape(from, to);
  }

  // --- Routing Strategies --------------------------------------------------

  _tryLShape(from, to, mode) {
    let mid;
    if (mode === 'horizontal_first') {
      mid = { x: to.x, y: from.y };   // corner at (to.x, from.y)
    } else {
      mid = { x: from.x, y: to.y };   // corner at (from.x, to.y)
    }

    const seg1Clear = !collidesWithAny(from, mid, this._segments);
    const seg2Clear = !collidesWithAny(mid, to,   this._segments);

    if (seg1Clear && seg2Clear) {
      return { waypoints: [from, mid, to], strategy: 'L_SHAPE' };
    }
    return null; // this variant is blocked
  }

  _zShape(from, to) {
    // Route: from → midH1 → midH2 → to
    // The horizontal offset is placed at the vertical midpoint
    const midY = (from.y + to.y) / 2;
    const midH1 = { x: from.x, y: midY };
    const midH2 = { x: to.x,   y: midY };

    return {
      waypoints: [from, midH1, midH2, to],
      strategy:  'Z_SHAPE',
    };
  }

  // =========================================================================
  // 3. Lifecycle & Cleanup
  // =========================================================================

  /** Clear all logical and visual wires */
  clear() {
    this.wires = [];          // Clear logical connections
    this.existingWires = [];  // Clear visual paths
    this._segments     = [];  // Clear collision cache
  }

  /** Remove the most recently added visual wire (helper for undo) */
  removeLastWire() {
    // Note: This only removes the visual path. 
    // Logic state management usually happens in the React parent.
    if (this.existingWires.length === 0) return null;
    const removed = this.existingWires.pop();
    this._rebuildSegments();
    return removed;
  }

  _rebuildSegments() {
    this._segments = [];
    this.existingWires.forEach(wp => {
      this._segments.push(...waypointsToSegments(wp));
    });
  }
}