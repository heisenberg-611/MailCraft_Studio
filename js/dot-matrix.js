/**
 * Interactive Dot Matrix Background Engine
 * Style: Sahinur.dev Matrix Terminal Architecture
 * Renders a crisp dot matrix grid covering the entire viewport.
 * When the cursor hovers or moves, individual matrix dots illuminate in
 * soothing emerald green (#00DC82) with smooth proximity scaling and decay.
 */

const DotMatrixEngine = {
  canvas: null,
  ctx: null,
  width: 0,
  height: 0,
  dpr: 1,
  
  // Matrix grid configuration
  gridSpacing: 28,        // Distance between grid dots in px
  baseDotRadius: 1.0,     // Idle dot radius
  maxDotRadius: 2.4,      // Hovered dot radius
  hoverRadius: 160,       // Mouse interaction influence radius in px
  
  // Mouse coordinates (viewport relative)
  mouse: {
    x: -9999,
    y: -9999,
    targetX: -9999,
    targetY: -9999,
    isHovering: false
  },
  
  // Grid dots collection
  dots: [],
  
  init(canvasId = 'matrixDotCanvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = canvasId;
      this.canvas.className = 'matrix-dot-canvas';
      document.body.prepend(this.canvas);
    }
    
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for optimal performance
    
    this.resize();
    this.bindEvents();
    this.loop();
  },
  
  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
    this.buildGrid();
  },
  
  buildGrid() {
    this.dots = [];
    const cols = Math.ceil(this.width / this.gridSpacing) + 2;
    const rows = Math.ceil(this.height / this.gridSpacing) + 2;
    
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        this.dots.push({
          x: c * this.gridSpacing,
          y: r * this.gridSpacing,
          intensity: 0
        });
      }
    }
  },
  
  bindEvents() {
    window.addEventListener('resize', () => this.resize(), { passive: true });
    
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = e.clientX;
      this.mouse.targetY = e.clientY;
      this.mouse.isHovering = true;
    }, { passive: true });
    
    document.addEventListener('mouseleave', () => {
      this.mouse.isHovering = false;
    });
  },
  
  loop() {
    if (this.mouse.isHovering) {
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.3;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.3;
    } else {
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    }
    
    this.render();
    requestAnimationFrame(() => this.loop());
  },
  
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    const mx = this.mouse.x;
    const my = this.mouse.y;
    const hr = this.hoverRadius;
    const hr2 = hr * hr;
    
    const count = this.dots.length;
    for (let i = 0; i < count; i++) {
      const dot = this.dots[i];
      const dx = dot.x - mx;
      const dy = dot.y - my;
      const dist2 = dx * dx + dy * dy;
      
      let targetIntensity = 0;
      if (dist2 < hr2) {
        const factor = 1 - Math.sqrt(dist2) / hr;
        targetIntensity = factor * factor; // Quadratic luminous gradient
      }
      
      // Responsive attack & smooth decay
      dot.intensity += (targetIntensity - dot.intensity) * (targetIntensity > dot.intensity ? 0.45 : 0.08);
      
      if (dot.intensity > 0.02) {
        // Active illuminated dot: Soothing Matrix Emerald (#00DC82)
        const rad = this.baseDotRadius + dot.intensity * (this.maxDotRadius - this.baseDotRadius);
        const alpha = 0.25 + dot.intensity * 0.75;
        
        // Center core
        this.ctx.beginPath();
        this.ctx.arc(dot.x, dot.y, rad, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(0, 220, 130, ${alpha})`;
        this.ctx.fill();
        
        // Glowing halo for close dots
        if (dot.intensity > 0.35) {
          this.ctx.beginPath();
          this.ctx.arc(dot.x, dot.y, rad + 1.5, 0, Math.PI * 2);
          this.ctx.fillStyle = `rgba(0, 220, 130, ${(dot.intensity - 0.35) * 0.22})`;
          this.ctx.fill();
        }
      } else {
        // Idle Matrix Dot: Crisp subtle dot
        this.ctx.beginPath();
        this.ctx.arc(dot.x, dot.y, this.baseDotRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        this.ctx.fill();
      }
    }
  }
};

// Initialize when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => DotMatrixEngine.init());
} else {
  DotMatrixEngine.init();
}
