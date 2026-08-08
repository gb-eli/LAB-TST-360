export function attachSceneDepth(scene, qualityManager) {
  if (!scene || scene.dataset.depthReady === '1') return;
  scene.dataset.depthReady = '1';

  const svg = scene.querySelector('svg');
  if (!svg) return;

  const enabled = () => qualityManager.level !== 'eco' && !matchMedia('(prefers-reduced-motion: reduce)').matches;

  function move(event) {
    if (!enabled()) return;
    const rect = scene.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / Math.max(1, rect.width) - .5) * 2;
    const y = ((event.clientY - rect.top) / Math.max(1, rect.height) - .5) * 2;
    const strength = qualityManager.level === 'ultra' ? 6 : qualityManager.level === 'high' ? 4.5 : 2.5;
    svg.style.transform = `scale(1.012) translate(${(-x*strength).toFixed(2)}px, ${(-y*strength).toFixed(2)}px)`;
    scene.style.setProperty('--light-x', `${50 + x*8}%`);
    scene.style.setProperty('--light-y', `${25 + y*6}%`);
  }

  function reset() {
    svg.style.transform = '';
    scene.style.removeProperty('--light-x');
    scene.style.removeProperty('--light-y');
  }

  scene.addEventListener('pointermove', move, {passive:true});
  scene.addEventListener('pointerleave', reset, {passive:true});
}
