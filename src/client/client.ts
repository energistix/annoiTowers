import * as THREE from "three"
import { BoxGeometry, CylinderGeometry, Mesh, MeshBasicMaterial, TextureLoader } from "three"

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.rotateX(-Math.PI / 6 + 0.3)
camera.position.set(0, 13, 20)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const woodTexture = new TextureLoader().load("./wood.jpg")
const woodMat = new MeshBasicMaterial({ map: woodTexture })
const darkerWoodMat = new MeshBasicMaterial({ map: woodTexture, color: 0xCCCCCC })

const box = new Mesh(new BoxGeometry(40, 2, 12, 2, 2, 2), darkerWoodMat)
scene.add(box)

function cylinder(x = 0) {
  const shape = new Mesh(new CylinderGeometry(1, 1, 10, 15, 5), darkerWoodMat)
  shape.position.x = x
  shape.position.y += 5
  box.add(shape)
}

const cylinderDistance = 12

cylinder(-cylinderDistance)
cylinder()
cylinder(cylinderDistance)

type diskList = Mesh<CylinderGeometry>[]
const disks: [diskList, diskList, diskList] = [[], [], []]

for (let i = 10; i > 2; i--) {
  const shape = new Mesh(new CylinderGeometry(i / 2, i / 2, 1, 15, 5), woodMat)
  shape.position.x = -cylinderDistance
  shape.position.y += 7 + (5 - i)
  disks[0].push(shape)
  box.add(shape)
}

type index = 0 | 1 | 2
function moveDisk(i1: index, i2: index) {
  const toMove = disks[i1].pop()
  const newTop = disks[i2].at(-1)
  if (!toMove) return
  const newSize = newTop ? newTop?.geometry.parameters.radiusTop : 10
  disks[newSize > (toMove?.geometry.parameters.radiusTop || 0) ? i2 : i1].push(toMove)
  updateDisksPositions()
}

function updateDisksPositions() {
  for (const i in disks) {
    const list = disks[i]
    for (const j in list) {
      const shape = list[j]
      shape.position.x = (Number(i) - 1) * cylinderDistance
      shape.position.y = 7 - (5 - Number(j))
    }
  }
}

function moveDisks(i1: index = 0, i2: index = 2, n: number = 0) {
  if (!n) n = disks[i1].length
  if (n == 1) {
    moveDisk(i1, i2)
  } else {
    const i3 = ([0, 1, 2] as index[]).filter((i) => i !== i1 && i !== i2)[0]
    moveDisks(i1, i3, n - 1)
    moveDisk(i1, i2)
    moveDisks(i3, i2, n - 1)
  }
}

moveDisks()

window.addEventListener("resize", onWindowResize, false)
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
  requestAnimationFrame(animate)

  render()
}

function render() {
  renderer.render(scene, camera)
}

animate()
