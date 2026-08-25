import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Sparkles, Move3d } from 'lucide-react'

// ── Procedural Letter Texture Generator ──────────────────────────
function createLetterCanvasTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1440
  const ctx = canvas.getContext('2d')

  if (!ctx) return new THREE.CanvasTexture(canvas)

  // Fundo em Papel Algodão / Linho
  ctx.fillStyle = '#fffdfa'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Borda decorativa dourada dupla
  ctx.strokeStyle = 'rgba(225, 29, 72, 0.25)'
  ctx.lineWidth = 6
  ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72)

  ctx.strokeStyle = 'rgba(212, 165, 116, 0.4)'
  ctx.lineWidth = 2
  ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96)

  // Marca d'água central de coração suave
  ctx.save()
  ctx.globalAlpha = 0.04
  ctx.fillStyle = '#e11d48'
  ctx.beginPath()
  const cx = canvas.width / 2
  const cy = canvas.height / 2
  ctx.moveTo(cx, cy + 120)
  ctx.bezierCurveTo(cx - 200, cy - 80, cx - 350, cy - 250, cx, cy - 400)
  ctx.bezierCurveTo(cx + 350, cy - 250, cx + 200, cy - 80, cx, cy + 120)
  ctx.fill()
  ctx.restore()

  // Cabeçalho da Carta
  ctx.fillStyle = '#be123c'
  ctx.font = 'bold 36px "Playfair Display", Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText('CORREIO ELEGANTE', canvas.width / 2, 130)

  ctx.fillStyle = '#701a35'
  ctx.font = 'italic 24px "EB Garamond", Georgia, serif'
  ctx.fillText('Coleção Especial • 14 de Fevereiro', canvas.width / 2, 175)

  // Linha divisória com arabesco
  ctx.strokeStyle = '#fda4af'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(canvas.width / 2 - 180, 210)
  ctx.lineTo(canvas.width / 2 + 180, 210)
  ctx.stroke()

  // Destinatário
  ctx.fillStyle = '#4c0519'
  ctx.font = 'bold italic 48px "Playfair Display", Georgia, serif'
  ctx.textAlign = 'left'
  ctx.fillText('Para o meu grande amor, Beatriz', 90, 310)

  // Corpo da Mensagem em Caligrafia Nobre
  ctx.font = 'italic 34px "EB Garamond", Georgia, serif'
  ctx.fillStyle = '#4c0519'

  const lines = [
    '"Desde aquele primeiro café sob a chuva até os',
    'nossos planos de construir uma vida inteira juntos,',
    'você é o meu lugar favorito no mundo.',
    '',
    'Obrigado por ser minha melhor amiga, minha paz',
    'e a inspiração de cada um dos meus dias.',
    'Que a nossa história seja sempre escrita com a',
    'mesma ternura com que te olho hoje."',
  ]

  let startY = 410
  for (const line of lines) {
    ctx.fillText(line, 90, startY)
    startY += 54
  }

  // Despedida e Assinatura
  ctx.textAlign = 'right'
  ctx.fillStyle = '#701a35'
  ctx.font = 'italic 28px "EB Garamond", Georgia, serif'
  ctx.fillText('Com todo o meu amor e carinho eterno,', canvas.width - 90, 1180)

  ctx.fillStyle = '#e11d48'
  ctx.font = 'bold italic 44px "Playfair Display", Georgia, serif'
  ctx.fillText('Lucas', canvas.width - 90, 1240)

  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

// ── Orbit Ribbon Text Canvas Texture ─────────────────────────────
function createRibbonTextTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 128
  const ctx = canvas.getContext('2d')

  if (!ctx) return new THREE.CanvasTexture(canvas)

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.0)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#e11d48'
  ctx.font = 'bold 36px "Outfit", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const repeatText = '✦ CORREIO ELEGANTE ✦ MOMENTOS ETERNOS ✦ DECLARAÇÕES INESQUECÍVEIS ✦ MÚSICA & POESIA '
  ctx.fillText(repeatText + repeatText, canvas.width / 2, canvas.height / 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.needsUpdate = true
  return texture
}

export function ThreeHeroExperience() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Referências mutáveis para a animação
  const animState = useRef({
    openProgress: 0,
    targetOpenProgress: 0,
    rotationY: 0,
    targetRotationY: 0,
    rotationX: 0,
    targetRotationX: 0,
    isDragging: false,
    prevPointerX: 0,
    prevPointerY: 0,
    vinylRotation: 0,
    ribbonOffset: 0,
  })

  // Disparar abertura / fechamento
  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev
      animState.current.targetOpenProgress = next ? 1 : 0
      if (next) setIsPlaying(true)
      return next
    })
  }, [])

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // 1. Setup Scene, Camera & Renderer
    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    )
    camera.position.set(0, 0, 7.2)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    // 2. Iluminação Tridimensional Cinemática
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0)
    keyLight.position.set(4, 5, 6)
    scene.add(keyLight)

    const fillLight = new THREE.PointLight(0xffa5ba, 2.5, 12)
    fillLight.position.set(-4, -2, 4)
    scene.add(fillLight)

    const goldRimLight = new THREE.PointLight(0xffd166, 2.0, 10)
    goldRimLight.position.set(0, 4, -3)
    scene.add(goldRimLight)

    // Luz que acompanha o mouse
    const pointerLight = new THREE.PointLight(0xff2b5e, 2.5, 8)
    pointerLight.position.set(0, 0, 3)
    scene.add(pointerLight)

    // 3. Grupo Principal da Carta / Envelope
    const rootGroup = new THREE.Group()
    scene.add(rootGroup)

    // ── Materiais ────────────────────────────────────────────────
    const paperMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xfff5f8,
      roughness: 0.35,
      metalness: 0.05,
      clearcoat: 0.2,
      clearcoatRoughness: 0.1,
      sheen: 0.6,
      sheenColor: new THREE.Color(0xffb3c6),
      side: THREE.DoubleSide,
    })

    const insideEnvelopeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffdbe5,
      roughness: 0.5,
      side: THREE.DoubleSide,
    })

    const waxMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd90429,
      roughness: 0.15,
      metalness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      emissive: new THREE.Color(0x590014),
      emissiveIntensity: 0.2,
    })

    const goldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd4a574,
      metalness: 0.85,
      roughness: 0.2,
      clearcoat: 0.5,
    })

    // ── A. Envelope Base ──────────────────────────────────────────
    const envelopeGroup = new THREE.Group()
    rootGroup.add(envelopeGroup)

    const envWidth = 3.6
    const envHeight = 2.4
    const envDepth = 0.12

    // Corpo do Envelope (Caixa com espessura)
    const envBackGeo = new THREE.BoxGeometry(envWidth, envHeight, envDepth)
    const envBackMesh = new THREE.Mesh(envBackGeo, paperMaterial)
    envelopeGroup.add(envBackMesh)

    // Aba Inferior Triangular Frontal
    const bottomFlapShape = new THREE.Shape()
    bottomFlapShape.moveTo(-envWidth / 2, -envHeight / 2)
    bottomFlapShape.lineTo(envWidth / 2, -envHeight / 2)
    bottomFlapShape.lineTo(0, 0.2)
    bottomFlapShape.closePath()

    const bottomFlapGeo = new THREE.ShapeGeometry(bottomFlapShape)
    const bottomFlapMesh = new THREE.Mesh(bottomFlapGeo, paperMaterial)
    bottomFlapMesh.position.z = envDepth / 2 + 0.01
    envelopeGroup.add(bottomFlapMesh)

    // Abas Laterais
    const leftFlapShape = new THREE.Shape()
    leftFlapShape.moveTo(-envWidth / 2, -envHeight / 2)
    leftFlapShape.lineTo(-envWidth / 2, envHeight / 2)
    leftFlapShape.lineTo(0, 0)
    leftFlapShape.closePath()

    const leftFlapMesh = new THREE.Mesh(
      new THREE.ShapeGeometry(leftFlapShape),
      insideEnvelopeMaterial
    )
    leftFlapMesh.position.z = envDepth / 2 + 0.005
    envelopeGroup.add(leftFlapMesh)

    const rightFlapShape = new THREE.Shape()
    rightFlapShape.moveTo(envWidth / 2, -envHeight / 2)
    rightFlapShape.lineTo(envWidth / 2, envHeight / 2)
    rightFlapShape.lineTo(0, 0)
    rightFlapShape.closePath()

    const rightFlapMesh = new THREE.Mesh(
      new THREE.ShapeGeometry(rightFlapShape),
      insideEnvelopeMaterial
    )
    rightFlapMesh.position.z = envDepth / 2 + 0.005
    envelopeGroup.add(rightFlapMesh)

    // ── B. Aba Superior com Dobradiça (Top Flap Hinge) ───────────
    const topFlapHinge = new THREE.Group()
    topFlapHinge.position.set(0, envHeight / 2, envDepth / 2 + 0.012)
    envelopeGroup.add(topFlapHinge)

    const topFlapShape = new THREE.Shape()
    topFlapShape.moveTo(-envWidth / 2, 0)
    topFlapShape.lineTo(envWidth / 2, 0)
    topFlapShape.lineTo(0, -envHeight * 0.58)
    topFlapShape.closePath()

    const topFlapMesh = new THREE.Mesh(new THREE.ShapeGeometry(topFlapShape), paperMaterial)
    topFlapHinge.add(topFlapMesh)

    // ── C. Selo de Cera 3D no Topo da Aba ─────────────────────────
    const waxSealGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.09, 32)
    waxSealGeo.rotateX(Math.PI / 2)
    const waxSealMesh = new THREE.Mesh(waxSealGeo, waxMaterial)
    waxSealMesh.position.set(0, -envHeight * 0.52, 0.05)
    topFlapHinge.add(waxSealMesh)

    // Anel Dourado do Selo
    const goldRingGeo = new THREE.TorusGeometry(0.34, 0.03, 16, 32)
    const goldRingMesh = new THREE.Mesh(goldRingGeo, goldMaterial)
    goldRingMesh.position.set(0, -envHeight * 0.52, 0.09)
    topFlapHinge.add(goldRingMesh)

    // Coração em Relevo no Centro do Selo
    const heartShape = new THREE.Shape()
    const hx = 0, hy = 0
    heartShape.moveTo(hx, hy + 0.08)
    heartShape.bezierCurveTo(hx - 0.12, hy + 0.18, hx - 0.22, hy + 0.02, hx, hy - 0.16)
    heartShape.bezierCurveTo(hx + 0.22, hy + 0.02, hx + 0.12, hy + 0.18, hx, hy + 0.08)

    const heartGeo = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.015,
      bevelThickness: 0.015,
    })
    const heartMesh = new THREE.Mesh(heartGeo, goldMaterial)
    heartMesh.position.set(0, -envHeight * 0.52, 0.08)
    topFlapHinge.add(heartMesh)

    // ── D. Folha da Carta 3D (Desliza e Desdobra) ────────────────
    const letterTexture = createLetterCanvasTexture()
    const letterMaterial = new THREE.MeshPhysicalMaterial({
      map: letterTexture,
      roughness: 0.3,
      metalness: 0.0,
      clearcoat: 0.15,
      side: THREE.DoubleSide,
    })

    const letterWidth = 3.2
    const letterHeight = 4.2
    const letterGeo = new THREE.PlaneGeometry(letterWidth, letterHeight, 32, 32)
    const letterMesh = new THREE.Mesh(letterGeo, letterMaterial)
    letterMesh.position.set(0, 0, 0)
    rootGroup.add(letterMesh)

    // ── E. Disco de Vinil 3D Giratório ────────────────────────────
    const vinylGroup = new THREE.Group()
    vinylGroup.position.set(2.4, 0.8, -0.4)
    rootGroup.add(vinylGroup)

    const vinylGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.04, 48)
    const vinylMat = new THREE.MeshPhysicalMaterial({
      color: 0x1f040b,
      roughness: 0.18,
      metalness: 0.3,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      iridescence: 0.9,
      iridescenceIOR: 1.6,
    })
    const vinylMesh = new THREE.Mesh(vinylGeo, vinylMat)
    vinylMesh.rotation.x = Math.PI / 2
    vinylGroup.add(vinylMesh)

    // Selo Central do Vinil
    const vinylCenterGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.045, 32)
    const vinylCenterMat = new THREE.MeshPhysicalMaterial({
      color: 0xe11d48,
      roughness: 0.3,
      clearcoat: 0.5,
    })
    const vinylCenterMesh = new THREE.Mesh(vinylCenterGeo, vinylCenterMat)
    vinylCenterMesh.rotation.x = Math.PI / 2
    vinylGroup.add(vinylCenterMesh)

    // ── F. Anel Orbital de Texto Cinético 3D ──────────────────────
    const ribbonTex = createRibbonTextTexture()
    const ribbonMat = new THREE.MeshBasicMaterial({
      map: ribbonTex,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    })
    const ribbonGeo = new THREE.CylinderGeometry(3.6, 3.6, 0.45, 64, 1, true)
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat)
    ribbonMesh.rotation.z = THREE.MathUtils.degToRad(22)
    ribbonMesh.rotation.x = THREE.MathUtils.degToRad(15)
    scene.add(ribbonMesh)

    // ── G. Partículas Flutuantes de Poeira Dourada e Brilhos ───────
    const particleCount = 140
    const particleGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    const particleScales = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 14
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 10
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 8
      particleScales[i] = Math.random() * 0.08 + 0.02
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const particleMat = new THREE.PointsMaterial({
      color: 0xffa5ba,
      size: 0.12,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    })
    const particlePoints = new THREE.Points(particleGeo, particleMat)
    scene.add(particlePoints)

    // ── Interação com o Mouse / Touch ─────────────────────────────
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2(-100, -100)

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      // Atualizar posição da luz do cursor no espaço 3D
      pointerLight.position.x = mouse.x * 4.5
      pointerLight.position.y = mouse.y * 3.2

      if (animState.current.isDragging) {
        const deltaX = e.clientX - animState.current.prevPointerX
        const deltaY = e.clientY - animState.current.prevPointerY
        animState.current.targetRotationY += deltaX * 0.008
        animState.current.targetRotationX += deltaY * 0.008
      } else {
        // Parallax sutil ao mover o mouse
        animState.current.targetRotationY = mouse.x * 0.35
        animState.current.targetRotationX = -mouse.y * 0.25
      }

      animState.current.prevPointerX = e.clientX
      animState.current.prevPointerY = e.clientY

      // Checar hover sobre o lacre de cera
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObject(waxSealMesh, true)
      setIsHovered(intersects.length > 0)
      container.style.cursor = intersects.length > 0 ? 'pointer' : 'grab'
    }

    const onPointerDown = (e: PointerEvent) => {
      animState.current.isDragging = true
      animState.current.prevPointerX = e.clientX
      animState.current.prevPointerY = e.clientY

      // Checar se clicou no selo de cera
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObject(waxSealMesh, true)
      if (intersects.length > 0) {
        toggleOpen()
      }
    }

    const onPointerUp = () => {
      animState.current.isDragging = false
    }

    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)

    // ── Loop de Renderização e Animação Cinemática ────────────────
    let animationFrameId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      const state = animState.current

      // Suavização do estado de abertura (LERP com inércia física)
      state.openProgress += (state.targetOpenProgress - state.openProgress) * 0.08
      const p = state.openProgress

      // Suavização de rotação com LERP
      state.rotationX += (state.targetRotationX - state.rotationX) * 0.08
      state.rotationY += (state.targetRotationY - state.rotationY) * 0.08

      // Rotação suave do grupo principal
      rootGroup.rotation.x = state.rotationX
      rootGroup.rotation.y = state.rotationY

      // Flutuação Orgânica em 3D
      rootGroup.position.y = Math.sin(elapsedTime * 1.6) * 0.08
      rootGroup.position.z = Math.cos(elapsedTime * 1.2) * 0.05

      // 1. Animação da Aba Superior do Envelope (Abre -170°)
      topFlapHinge.rotation.x = -p * Math.PI * 0.95

      // 2. Animação da Folha da Carta (Desliza para cima e vem para a frente)
      letterMesh.position.y = -0.1 + p * 2.2
      letterMesh.position.z = envDepth / 2 + 0.02 + p * 0.15
      letterMesh.scale.set(
        0.95 + p * 0.05,
        0.5 + p * 0.5,
        1
      )

      // Leve curvatura e inclinação poética da carta aberta
      letterMesh.rotation.x = p * 0.15
      letterMesh.rotation.z = -p * 0.04

      // 3. Disco de Vinil (Surge flutuando e gira)
      vinylGroup.position.x = 1.2 + p * 1.6
      vinylGroup.position.y = 0.2 + p * 1.1 + Math.sin(elapsedTime * 2) * 0.05
      vinylGroup.scale.setScalar(0.4 + p * 0.6)
      vinylGroup.rotation.y = p * 0.35

      if (isPlaying || p > 0.5) {
        state.vinylRotation += 0.035
        vinylMesh.rotation.z = state.vinylRotation
      }

      // 4. Anel Orbital de Texto
      state.ribbonOffset += 0.0015
      ribbonTex.offset.x = state.ribbonOffset
      ribbonMesh.rotation.y = elapsedTime * 0.15

      // 5. Partículas flutuantes
      particlePoints.rotation.y = elapsedTime * 0.03
      particlePoints.rotation.x = Math.sin(elapsedTime * 0.05) * 0.1

      // 6. Pulsação do Selo de Cera quando fechado
      if (p < 0.2) {
        const pulse = 1 + Math.sin(elapsedTime * 3) * 0.04
        waxSealMesh.scale.set(pulse, pulse, pulse)
      } else {
        waxSealMesh.scale.set(1, 1, 1)
      }

      renderer.render(scene, camera)
    }

    animate()

    // ── Resize Observer ───────────────────────────────────────────
    const handleResize = () => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    // ── Cleanup ───────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId)
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('resize', handleResize)

      renderer.dispose()
      letterTexture.dispose()
      ribbonTex.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [toggleOpen, isPlaying])

  return (
    <div className="relative w-full h-[480px] sm:h-[580px] lg:h-[640px] flex items-center justify-center">
      {/* Canvas 3D do Three.js */}
      <div
        ref={mountRef}
        className="w-full h-full relative z-10 touch-none select-none"
      />

      {/* Dica Flutuante de Interação no Canvas */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-2 pointer-events-auto bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-pink-300/80 shadow-lg shadow-rose-900/10 text-xs font-bold text-[#4c0519]">
        <button
          type="button"
          onClick={toggleOpen}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e11d48] text-white hover:bg-[#be123c] transition-all cursor-pointer shadow-xs"
        >
          {isOpen ? <RotateCcw size={14} /> : <Sparkles size={14} />}
          <span>{isOpen ? 'Fechar carta 3D' : 'Deslacrar em 3D'}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
            isPlaying
              ? 'bg-rose-100 border-rose-300 text-[#e11d48]'
              : 'bg-white border-pink-200 text-[#701a35] hover:bg-rose-50'
          }`}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          <span>{isPlaying ? 'Pausar música' : 'Tocar vinil'}</span>
        </button>

        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#701a35] font-medium pl-1">
          <Move3d size={13} className="text-[#e11d48]" />
          Arraste para girar 360°
        </span>
      </div>

      {/* Feedback de Hover sobre o Selo */}
      {isHovered && !isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-[#4c0519] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg"
        >
          Toque para quebrar o lacre de cera
        </motion.div>
      )}
    </div>
  )
}
