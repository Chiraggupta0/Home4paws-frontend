import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth;
    const H = mount.clientHeight;

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // ── Particles ──────────────────────────────────────────────
    const COUNT = 200;
    const positions = new Float32Array(COUNT * 3);
    const speeds    = new Float32Array(COUNT);
    const offsets   = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      speeds[i]  = 0.3 + Math.random() * 0.7;
      offsets[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xE8956A,
      size: 0.07,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    // ── Large soft blobs ────────────────────────────────────────
    const blobs = [];
    const blobData = [
      { color: 0xC96F3A, size: 1.2, x: -4, y: 2,  z: -2 },
      { color: 0xF5B942, size: 0.8, x:  5, y: -1, z: -3 },
      { color: 0xE8956A, size: 1.0, x:  2, y:  3, z: -4 },
    ];
    blobData.forEach(d => {
      const g = new THREE.SphereGeometry(d.size, 16, 16);
      const m = new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0.08 });
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(d.x, d.y, d.z);
      scene.add(mesh);
      blobs.push(mesh);
    });

    // ── Mouse parallax ──────────────────────────────────────────
    let mouse = { x: 0, y: 0 };
    const onMove = e => {
      mouse.x = (e.clientX / W - 0.5) * 2;
      mouse.y = -(e.clientY / H - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove);

    // ── Animation ───────────────────────────────────────────────
    let raf;
    const clock = new THREE.Clock();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Float particles
      const pos = geo.attributes.position.array;
      for (let i = 0; i < COUNT; i++) {
        pos[i * 3 + 1] += Math.sin(t * speeds[i] + offsets[i]) * 0.001;
      }
      geo.attributes.position.needsUpdate = true;

      particles.rotation.y = t * 0.04 + mouse.x * 0.05;
      particles.rotation.x = mouse.y * 0.03;

      blobs.forEach((b, i) => {
        b.position.y += Math.sin(t * 0.4 + i * 1.5) * 0.003;
        b.rotation.z = t * 0.08;
      });

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ──────────────────────────────────────────────────
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
