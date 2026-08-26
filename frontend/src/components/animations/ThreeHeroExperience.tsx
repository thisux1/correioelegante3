import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'

// ── Procedural Fine Cotton Paper Texture with Fibers & Bump ────────
function createCottonPaperTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  ctx.fillStyle = '#faf7f5'
  ctx.fillRect(0, 0, 1024, 1024)

  const imgData = ctx.getImageData(0, 0, 1024, 1024)
  const data = imgData.data

  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 14
    data[i] = Math.min(255, Math.max(0, data[i] + grain))
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain * 0.95))
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain * 0.9))
  }
  ctx.putImageData(imgData, 0, 0)

  ctx.strokeStyle = 'rgba(214, 180, 190, 0.08)'
  ctx.lineWidth = 1
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * 1024
    const y = Math.random() * 1024
    const len = 4 + Math.random() * 12
    const angle = Math.random() * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len)
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  return texture
}

// ── High-DPI Romantic Calligraphy Letter Texture (2048 x 2880) ──────
function createLetterCanvasTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 2880
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  ctx.fillStyle = '#fffdfb'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = 'rgba(212, 165, 116, 0.5)'
  ctx.lineWidth = 6
  ctx.strokeRect(64, 64, canvas.width - 128, canvas.height - 128)

  ctx.strokeStyle = 'rgba(225, 29, 72, 0.35)'
  ctx.lineWidth = 2
  ctx.strokeRect(84, 84, canvas.width - 168, canvas.height - 168)

  ctx.save()
  ctx.globalAlpha = 0.035
  ctx.fillStyle = '#e11d48'
  ctx.beginPath()
  const cx = canvas.width / 2
  const cy = canvas.height / 2
  ctx.moveTo(cx, cy + 240)
  ctx.bezierCurveTo(cx - 380, cy - 100, cx - 620, cy - 400, cx, cy - 680)
  ctx.bezierCurveTo(cx + 620, cy - 400, cx + 380, cy - 100, cx, cy + 240)
  ctx.fill()
  ctx.restore()

  ctx.fillStyle = '#be123c'
  ctx.font = 'bold 72px "Playfair Display", Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText('CORREIO ELEGANTE', canvas.width / 2, 290)

  ctx.fillStyle = '#881337'
  ctx.font = 'italic 46px "EB Garamond", Georgia, serif'
  ctx.fillText('Declaração Especial • Guardada para Sempre', canvas.width / 2, 375)

  ctx.strokeStyle = '#fecdd3'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(canvas.width / 2 - 300, 440)
  ctx.lineTo(canvas.width / 2 + 300, 440)
  ctx.stroke()

  ctx.fillStyle = '#e11d48'
  ctx.font = '36px "Playfair Display", Georgia, serif'
  ctx.fillText('❦', canvas.width / 2, 448)

  ctx.fillStyle = '#4c0519'
  ctx.font = 'bold italic 88px "Playfair Display", Georgia, serif'
  ctx.textAlign = 'left'
  ctx.fillText('Para o meu grande amor,', 160, 640)

  ctx.font = 'italic 66px "EB Garamond", Georgia, serif'
  ctx.fillStyle = '#4c0519'

  const lines = [
    'Entre todas as esquinas da vida e todos os encontros',
    'possíveis no universo, foi no seu sorriso que eu encontrei',
    'o meu lugar favorito de pertencer.',
    '',
    'Obrigado por transformar dias comuns em memórias raras,',
    'por ser a melodia serena no meio do caos e por segurar',
    'minha mão com a ternura de quem cuida de um sonho.',
    '',
    'Que a nossa história continue sendo escrita a cada nascer',
    'do sol, com o mesmo brilho com que te vejo agora.',
  ]

  let startY = 820
  for (const line of lines) {
    if (line === '') {
      startY += 40
    } else {
      ctx.fillText(line, 160, startY)
      startY += 96
    }
  }

  ctx.textAlign = 'right'
  ctx.fillStyle = '#701a35'
  ctx.font = 'italic 52px "EB Garamond", Georgia, serif'
  ctx.fillText('Com todo o amor que habita em mim,', canvas.width - 160, 2380)

  ctx.fillStyle = '#be123c'
  ctx.font = 'bold italic 86px "Playfair Display", Georgia, serif'
  ctx.fillText('Para Sempre Seu', canvas.width - 160, 2500)

  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 16
  texture.needsUpdate = true
  return texture
}

// ── Contact Shadow Texture ─────────────────────────────────────────
function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  const gradient = ctx.createRadialGradient(256, 256, 10, 256, 256, 250)
  gradient.addColorStop(0, 'rgba(76, 5, 25, 0.35)')
  gradient.addColorStop(0.3, 'rgba(112, 26, 53, 0.18)')
  gradient.addColorStop(0.65, 'rgba(244, 63, 94, 0.05)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 512, 512)

  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

// ── Glowing Radial Point Texture for Stardust Particles ────────────
function createGlowPointTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30)
  grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)')
  grad.addColorStop(0.2, 'rgba(255, 190, 210, 0.9)')
  grad.addColorStop(0.55, 'rgba(225, 29, 72, 0.35)')
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)')

  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 64, 64)

  const tex = new THREE.CanvasTexture(canvas)
  return tex
}

// ── Volumetric Sunbeam Texture ─────────────────────────────────────
function createSunbeamTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  const grad = ctx.createLinearGradient(0, 0, 512, 512)
  grad.addColorStop(0, 'rgba(255, 245, 230, 0.28)')
  grad.addColorStop(0.35, 'rgba(255, 210, 225, 0.14)')
  grad.addColorStop(0.7, 'rgba(244, 63, 94, 0.04)')
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)')

  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 512)
  return new THREE.CanvasTexture(canvas)
}

// ── Organic Wax Seal Geometry with Natural Pressed Edge ───────────
function createOrganicWaxGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape()
  const segments = 48
  const baseRadius = 0.42

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2
    const noise =
      Math.sin(theta * 5) * 0.025 +
      Math.cos(theta * 8) * 0.015 +
      Math.sin(theta * 13) * 0.01
    const r = baseRadius + noise
    const x = Math.cos(theta) * r
    const y = Math.sin(theta) * r

    if (i === 0) {
      shape.moveTo(x, y)
    } else {
      shape.lineTo(x, y)
    }
  }

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 1,
    depth: 0.07,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.035,
    bevelOffset: 0,
    bevelSegments: 4,
  }

  return new THREE.ExtrudeGeometry(shape, extrudeSettings)
}

export function ThreeHeroExperience() {
  const mountRef = useRef<HTMLDivElement>(null)

  const animState = useRef({
    openProgress: 0,
    targetOpenProgress: 0,
    isOpen: false,
    rotationY: 0,
    targetRotationY: 0,
    rotationX: 0,
    targetRotationX: 0,
    isDragging: false,
    prevPointerX: 0,
    prevPointerY: 0,
    isHovered: false,
  })

  const toggleOpen = useCallback(() => {
    animState.current.isOpen = !animState.current.isOpen
    animState.current.targetOpenProgress = animState.current.isOpen ? 1 : 0
  }, [])

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // 1. Scene, Camera & Renderer
    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    )
    camera.position.set(0, 0.15, 8.4)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.35
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    // 2. Background Ethereal Aura Shader Mesh
    const auraUniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    }

    const auraMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        varying vec2 vUv;

        void main() {
          vec2 p = vUv - 0.5;
          float dist = length(p);
          
          float wave1 = sin(dist * 7.0 - uTime * 0.7) * 0.12;
          float wave2 = cos(p.x * 5.0 + p.y * 3.5 + uTime * 0.5) * 0.10;
          float glow = 1.0 - smoothstep(0.0, 0.62 + wave1 + wave2, dist);
          
          vec3 colCenter = vec3(1.0, 0.92, 0.94);
          vec3 colMid = vec3(0.96, 0.45, 0.58);
          vec3 colOuter = vec3(0.55, 0.08, 0.22);
          
          vec3 color = mix(colCenter, colMid, smoothstep(0.0, 0.4, dist));
          color = mix(color, colOuter, smoothstep(0.3, 0.68, dist));
          
          float alpha = glow * 0.32 * (1.0 - smoothstep(0.25, 0.75, dist));
          gl_FragColor = vec4(color, alpha);
        }
      `,
      uniforms: auraUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    })

    const auraPlane = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), auraMaterial)
    auraPlane.position.set(0, 0.2, -3.2)
    scene.add(auraPlane)

    // 3. Volumetric Sunbeam Mesh
    const sunbeamTex = createSunbeamTexture()
    const sunbeamMat = new THREE.MeshBasicMaterial({
      map: sunbeamTex,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    const sunbeamPlane = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), sunbeamMat)
    sunbeamPlane.rotation.z = -0.42
    sunbeamPlane.position.set(-1.2, 1.2, -1.0)
    scene.add(sunbeamPlane)

    // 4. Iluminação Suave de Estúdio Físico
    const ambientLight = new THREE.AmbientLight(0xfff7f9, 1.9)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xfffbf5, 2.8)
    keyLight.position.set(3.5, 6, 4.5)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = 2048
    keyLight.shadow.mapSize.height = 2048
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = 18
    keyLight.shadow.bias = -0.0008
    scene.add(keyLight)

    const fillLight = new THREE.PointLight(0xffa5ba, 2.2, 14)
    fillLight.position.set(-4, -1.5, 4.0)
    scene.add(fillLight)

    const rimGold = new THREE.PointLight(0xfcd34d, 2.4, 12)
    rimGold.position.set(0, 5.0, -3.5)
    scene.add(rimGold)

    const cursorLight = new THREE.PointLight(0xff4372, 1.9, 9)
    cursorLight.position.set(0, 0, 4.5)
    scene.add(cursorLight)

    // 5. Texturas & Materiais
    const cottonPaperTex = createCottonPaperTexture()
    const letterTex = createLetterCanvasTexture()
    const shadowTex = createContactShadowTexture()
    const glowPointTex = createGlowPointTexture()

    const envelopeOuterMat = new THREE.MeshPhysicalMaterial({
      color: 0xfffcfb,
      roughness: 0.38,
      map: cottonPaperTex,
      bumpMap: cottonPaperTex,
      bumpScale: 0.006,
      clearcoat: 0.08,
      clearcoatRoughness: 0.2,
      sheen: 0.6,
      sheenColor: new THREE.Color(0xffccd7),
      side: THREE.DoubleSide,
    })

    const envelopeInnerMat = new THREE.MeshPhysicalMaterial({
      color: 0xffe8ee,
      roughness: 0.45,
      map: cottonPaperTex,
      bumpMap: cottonPaperTex,
      bumpScale: 0.004,
      sheen: 0.8,
      sheenColor: new THREE.Color(0xfda4af),
      side: THREE.DoubleSide,
    })

    const waxMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xbe123c,
      roughness: 0.18,
      metalness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      sheen: 0.8,
      sheenColor: new THREE.Color(0xff4372),
      emissive: new THREE.Color(0x4c0519),
      emissiveIntensity: 0.2,
    })

    const goldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd4a574,
      metalness: 0.88,
      roughness: 0.16,
      clearcoat: 0.8,
    })

    // 6. Raiz do Objeto 3D
    const rootGroup = new THREE.Group()
    scene.add(rootGroup)

    const envW = 3.5
    const envH = 2.35
    const envDepth = 0.14

    // ── SOMBRA DE CONTATO NO PISO ─────────────────────────────────
    const shadowGeo = new THREE.PlaneGeometry(5.8, 3.4)
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    })
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat)
    shadowMesh.rotation.x = -Math.PI / 2
    shadowMesh.position.y = -2.1
    scene.add(shadowMesh)

    // ── A. ENVELOPE VOLUMÉTRICO ───────────────────────────────────
    const envelopeGroup = new THREE.Group()
    rootGroup.add(envelopeGroup)

    // Verso sólido do envelope
    const backShape = new THREE.Shape()
    const r = 0.12
    const w2 = envW / 2
    const h2 = envH / 2

    backShape.moveTo(-w2 + r, -h2)
    backShape.lineTo(w2 - r, -h2)
    backShape.quadraticCurveTo(w2, -h2, w2, -h2 + r)
    backShape.lineTo(w2, h2 - r)
    backShape.quadraticCurveTo(w2, h2, w2 - r, h2)
    backShape.lineTo(-w2 + r, h2)
    backShape.quadraticCurveTo(-w2, h2, -w2, h2 - r)
    backShape.lineTo(-w2, -h2 + r)
    backShape.quadraticCurveTo(-w2, -h2, -w2 + r, -h2)

    const backGeo = new THREE.ExtrudeGeometry(backShape, {
      depth: 0.035,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    })
    const backMesh = new THREE.Mesh(backGeo, envelopeOuterMat)
    backMesh.position.z = -envDepth / 2
    backMesh.castShadow = true
    backMesh.receiveShadow = true
    envelopeGroup.add(backMesh)

    // Placa Frontal do envelope (com abertura côncava elegante)
    const frontShape = new THREE.Shape()
    frontShape.moveTo(-w2, -h2)
    frontShape.lineTo(w2, -h2)
    frontShape.lineTo(w2, 0.05)
    frontShape.lineTo(0, -0.45)
    frontShape.lineTo(-w2, 0.05)
    frontShape.closePath()

    const frontGeo = new THREE.ExtrudeGeometry(frontShape, {
      depth: 0.02,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.012,
      bevelThickness: 0.012,
    })
    const frontMesh = new THREE.Mesh(frontGeo, envelopeOuterMat)
    frontMesh.position.z = envDepth / 2
    frontMesh.castShadow = true
    frontMesh.receiveShadow = true
    envelopeGroup.add(frontMesh)

    // Abas Laterais Internas
    const sideLeftShape = new THREE.Shape()
    sideLeftShape.moveTo(-w2, -h2)
    sideLeftShape.lineTo(-w2, h2)
    sideLeftShape.lineTo(-0.1, -0.05)
    sideLeftShape.closePath()
    const leftMesh = new THREE.Mesh(
      new THREE.ShapeGeometry(sideLeftShape),
      envelopeInnerMat
    )
    leftMesh.position.z = envDepth / 2 - 0.005
    envelopeGroup.add(leftMesh)

    const sideRightShape = new THREE.Shape()
    sideRightShape.moveTo(w2, -h2)
    sideRightShape.lineTo(w2, h2)
    sideRightShape.lineTo(0.1, -0.05)
    sideRightShape.closePath()
    const rightMesh = new THREE.Mesh(
      new THREE.ShapeGeometry(sideRightShape),
      envelopeInnerMat
    )
    rightMesh.position.z = envDepth / 2 - 0.005
    envelopeGroup.add(rightMesh)

    // ── B. ABA SUPERIOR COM LACRE DE CERA ARTESANAL ───────────────
    const topHinge = new THREE.Group()
    topHinge.position.set(0, h2, envDepth / 2 + 0.012)
    envelopeGroup.add(topHinge)

    const flapShape = new THREE.Shape()
    flapShape.moveTo(-w2, 0)
    flapShape.lineTo(w2, 0)
    flapShape.lineTo(0, -envH * 0.65)
    flapShape.closePath()

    const flapGeo = new THREE.ExtrudeGeometry(flapShape, {
      depth: 0.02,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.012,
      bevelThickness: 0.012,
    })
    const topFlapMesh = new THREE.Mesh(flapGeo, envelopeOuterMat)
    topFlapMesh.castShadow = true
    topFlapMesh.receiveShadow = true
    topHinge.add(topFlapMesh)

    const waxGroup = new THREE.Group()
    waxGroup.position.set(0, -envH * 0.54, 0.04)
    topHinge.add(waxGroup)

    const waxGeo = createOrganicWaxGeometry()
    const waxMesh = new THREE.Mesh(waxGeo, waxMaterial)
    waxMesh.castShadow = true
    waxMesh.receiveShadow = true
    waxGroup.add(waxMesh)

    const goldRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.022, 16, 32),
      goldMaterial
    )
    goldRim.position.z = 0.09
    waxGroup.add(goldRim)

    const heartShape = new THREE.Shape()
    const hx = 0
    const hy = 0
    heartShape.moveTo(hx, hy + 0.06)
    heartShape.bezierCurveTo(hx - 0.12, hy + 0.18, hx - 0.22, hy + 0.02, hx, hy - 0.18)
    heartShape.bezierCurveTo(hx + 0.22, hy + 0.02, hx + 0.12, hy + 0.18, hx, hy + 0.06)

    const heartGeo = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.025,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.01,
      bevelThickness: 0.01,
    })
    const heartMesh = new THREE.Mesh(heartGeo, goldMaterial)
    heartMesh.position.set(0, 0.04, 0.08)
    heartMesh.scale.set(0.65, 0.65, 0.65)
    waxGroup.add(heartMesh)

    // ── C. CARTA ARTESANAL 3D COM SUBIDA ESTRITAMENTE VERTICAL ──
    const letterMat = new THREE.MeshPhysicalMaterial({
      map: letterTex,
      bumpMap: cottonPaperTex,
      bumpScale: 0.005,
      roughness: 0.32,
      clearcoat: 0.1,
      side: THREE.DoubleSide,
    })

    const letterW = 2.85
    const letterH = 3.65
    const letterGeo = new THREE.PlaneGeometry(letterW, letterH, 32, 32)

    // Curvatura estática suave das margens do papel
    const posAttr = letterGeo.attributes.position
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i)
      const vy = posAttr.getY(i)
      const arch = Math.sin((vx / letterW) * Math.PI) * 0.04 - Math.cos((vy / letterH) * Math.PI) * 0.02
      posAttr.setZ(i, arch)
    }
    letterGeo.computeVertexNormals()

    // O papel reside estritamente em z = 0.00 no centro do bolsão do envelope
    const letterMesh = new THREE.Mesh(letterGeo, letterMat)
    letterMesh.castShadow = true
    letterMesh.receiveShadow = true
    letterMesh.position.set(0, -0.28, 0.0)
    rootGroup.add(letterMesh)

    // ── D. PINGENTES DE CORAÇÃO DOURADO FLUTUANTES (CHARMS) ──────
    const charmGroup = new THREE.Group()
    scene.add(charmGroup)

    const charms: { mesh: THREE.Mesh; basePos: THREE.Vector3; speed: number; rotX: number; rotY: number; phase: number }[] = []
    for (let i = 0; i < 5; i++) {
      const charmMesh = new THREE.Mesh(heartGeo, goldMaterial)
      const angle = (i / 5) * Math.PI * 2
      const rad = 3.3 + (i % 2) * 0.7
      const basePos = new THREE.Vector3(
        Math.cos(angle) * rad,
        -0.8 + (i % 3) * 0.9,
        (i % 2 === 0 ? 1 : -1) * (0.6 + (i * 0.3))
      )
      charmMesh.position.copy(basePos)
      charmMesh.scale.setScalar(0.2 + (i % 3) * 0.06)
      charmGroup.add(charmMesh)
      charms.push({
        mesh: charmMesh,
        basePos,
        speed: 0.7 + (i * 0.15),
        rotX: 0.01 + (i * 0.005),
        rotY: 0.015 + (i * 0.004),
        phase: i * 1.4,
      })
    }

    // ── E. STARDUST: NUVEM DE PARTÍCULAS EM CAMADAS COM GLOW ──────
    const pCount = 110
    const pGeo = new THREE.BufferGeometry()
    const pPos = new Float32Array(pCount * 3)

    for (let i = 0; i < pCount; i++) {
      pPos[i * 3 + 0] = (Math.random() - 0.5) * 11
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 9
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 7
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    const pMat = new THREE.PointsMaterial({
      map: glowPointTex,
      size: 0.22,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const particles = new THREE.Points(pGeo, pMat)
    scene.add(particles)

    // ── INTERAÇÃO: RAYCASTER, MOUSE E DRAG 360° ──────────────────
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2(-100, -100)
    const interactiveMeshes = [waxMesh, goldRim, heartMesh, frontMesh, backMesh, topFlapMesh, letterMesh]

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      cursorLight.position.x = mouse.x * 4.2
      cursorLight.position.y = mouse.y * 3.2
      auraUniforms.uMouse.value.set((mouse.x + 1) * 0.5, (mouse.y + 1) * 0.5)

      if (animState.current.isDragging) {
        const dx = e.clientX - animState.current.prevPointerX
        const dy = e.clientY - animState.current.prevPointerY
        animState.current.targetRotationY += dx * 0.007
        animState.current.targetRotationX += dy * 0.007
      } else {
        animState.current.targetRotationY = mouse.x * 0.28
        animState.current.targetRotationX = -mouse.y * 0.18
      }

      animState.current.prevPointerX = e.clientX
      animState.current.prevPointerY = e.clientY

      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(interactiveMeshes, true)
      animState.current.isHovered = hits.length > 0
      container.style.cursor = animState.current.isDragging
        ? 'grabbing'
        : hits.length > 0
        ? 'pointer'
        : 'grab'
    }

    let pointerDownTime = 0

    const onPointerDown = (e: PointerEvent) => {
      animState.current.isDragging = true
      animState.current.prevPointerX = e.clientX
      animState.current.prevPointerY = e.clientY
      pointerDownTime = Date.now()
    }

    const onPointerUp = (e: PointerEvent) => {
      const isClick = Date.now() - pointerDownTime < 240
      animState.current.isDragging = false

      if (isClick) {
        const rect = container.getBoundingClientRect()
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
        raycaster.setFromCamera(mouse, camera)
        const hits = raycaster.intersectObjects(interactiveMeshes, true)
        if (hits.length > 0) {
          toggleOpen()
        }
      }
    }

    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)

    // ── RENDER LOOP & DINÂMICA FÍSICA CINEMATOGRÁFICA ─────────────
    let animationFrameId: number
    const clock = new THREE.Clock()

    const clamp = (val: number, min = 0, max = 1) => Math.max(min, Math.min(max, val))
    const smoothstep = (edge0: number, edge1: number, x: number) => {
      const t = clamp((x - edge0) / (edge1 - edge0))
      return t * t * (3 - 2 * t)
    }
    const easeOutQuart = (x: number) => 1 - Math.pow(1 - x, 4)
    const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3)

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const delta = Math.min(clock.getDelta(), 0.05)
      const t = clock.getElapsedTime()
      const state = animState.current

      // Atualiza shader do background
      auraUniforms.uTime.value = t

      // Suavização do estado de abertura geral cadenciada (~1.8s)
      const target = state.targetOpenProgress
      const animSpeed = 0.52
      const step = delta * animSpeed
      if (state.openProgress < target) {
        state.openProgress = Math.min(target, state.openProgress + step)
      } else if (state.openProgress > target) {
        state.openProgress = Math.max(target, state.openProgress - step)
      }
      const p = state.openProgress

      // ── COREOGRAFIA DRAMÁTICA EM 2 ETAPAS (SEM CLIPPING) ───────
      // ETAPA 1: O lacre de cera quebra, a aba superior abre e recua para trás do envelope (0.0 -> 0.44)
      const flapProgress = smoothstep(0.0, 0.44, p)
      topHinge.position.z = THREE.MathUtils.lerp(envDepth / 2 + 0.012, -envDepth / 2 - 0.025, flapProgress)
      topHinge.rotation.x = -flapProgress * Math.PI * 1.15

      // ETAPA 2: A carta desliza estritamente na vertical e o conjunto se eleva (0.38 -> 1.0)
      const letterNorm = clamp((p - 0.38) / 0.62)
      const letterProgress = easeOutQuart(letterNorm)
      const compositionLift = easeOutCubic(letterNorm)

      // Câmera dinâmica cinematográfica sem clipping
      camera.position.y = 0.15 + compositionLift * 0.52
      camera.position.z = 8.4 + compositionLift * 0.65

      // Rotação inercial com amortecimento suave
      state.rotationX += (state.targetRotationX - state.rotationX) * 0.075
      state.rotationY += (state.targetRotationY - state.rotationY) * 0.075

      rootGroup.rotation.x = state.rotationX
      rootGroup.rotation.y = state.rotationY

      // Flutuação orgânica levitando no ar
      const floatY = Math.sin(t * 1.4) * 0.07
      rootGroup.position.y = floatY

      // Sombra acompanha a distância do chão
      shadowMesh.scale.setScalar(1 - floatY * 0.35)
      shadowMesh.material.opacity = 0.55 - floatY * 0.15

      // 1. Envelope como pedestal
      envelopeGroup.position.y = -compositionLift * 0.28

      // 2. A folha da carta sobe estritamente ao longo de Y em z = 0.00 (ZERO colisão / ZERO clipping)
      letterMesh.position.y = -0.28 + letterProgress * 2.15
      letterMesh.position.z = 0.00
      letterMesh.rotation.x = 0.00
      letterMesh.scale.set(
        0.96 + letterProgress * 0.04,
        0.55 + letterProgress * 0.45,
        1
      )
      letterMesh.visible = flapProgress > 0.05

      // 3. Brilho do lacre de cera e pulso poético
      if (p < 0.15) {
        const pulse = 1 + Math.sin(t * 3.2) * 0.035
        waxGroup.scale.set(pulse, pulse, pulse)
        waxMaterial.emissiveIntensity = 0.2 + Math.sin(t * 3.2) * 0.1
      } else {
        waxGroup.scale.set(1, 1, 1)
        waxMaterial.emissiveIntensity = 0.15
      }

      // 4. Feixe de luz solar oscila suavemente
      sunbeamPlane.rotation.z = -0.42 + Math.sin(t * 0.6) * 0.04
      sunbeamMat.opacity = 0.45 + compositionLift * 0.15 + Math.sin(t * 1.2) * 0.06

      // 5. Luzes intensificam sutilmente na abertura
      keyLight.intensity = 2.8 + compositionLift * 0.6
      fillLight.intensity = 2.2 + compositionLift * 0.4

      // 6. Charms flutuantes orbitam suavemente
      for (const charm of charms) {
        charm.mesh.position.y = charm.basePos.y + Math.sin(t * charm.speed + charm.phase) * 0.14
        charm.mesh.rotation.x += charm.rotX
        charm.mesh.rotation.y += charm.rotY
      }

      // 7. Partículas flutuam suavemente
      particles.rotation.y = t * 0.02
      particles.position.y = Math.sin(t * 0.7) * 0.06

      renderer.render(scene, camera)
    }

    animate()

    // ── Resize & Cleanup ──────────────────────────────────────────
    const handleResize = () => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('resize', handleResize)

      renderer.dispose()
      cottonPaperTex.dispose()
      letterTex.dispose()
      shadowTex.dispose()
      glowPointTex.dispose()
      sunbeamTex.dispose()
      waxGeo.dispose()
      backGeo.dispose()
      frontGeo.dispose()
      flapGeo.dispose()
      letterGeo.dispose()
      shadowGeo.dispose()
      pGeo.dispose()
      heartGeo.dispose()

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [toggleOpen])

  return (
    <div className="relative w-full h-[520px] sm:h-[620px] lg:h-[700px] flex items-center justify-center overflow-visible">
      {/* Canvas 3D do Three.js */}
      <div
        ref={mountRef}
        className="w-full h-full relative z-10 touch-none select-none cursor-grab active:cursor-grabbing overflow-visible"
      />
    </div>
  )
}


