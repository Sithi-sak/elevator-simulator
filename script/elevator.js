// elevator.js
import {
  FLOOR_HEIGHT,
  DOOR_ANIMATION_DURATION,
  TRAVEL_TIME_PER_FLOOR,
  UPDATE_INTERVAL,
  TOTAL_FLOORS,
} from "./constants.js";

export class Elevator {
  constructor(id) {
    this.id = id; // "left" or "right"
    this.currentFloor = 1;
    this.targetFloor = 1;
    this.isMoving = false;
    this.doorsOpen = false;
    this.pendingDirection = null;
    this.doorElement = document.querySelector(`.${id}-door`);
    this.controlPanel = document.querySelector(`.${id}-control`);
  }

  openDoor() {
    if (this.doorsOpen || this.isMoving) return;

    const leftPanel = this.doorElement.querySelector(".left-panel");
    const rightPanel = this.doorElement.querySelector(".right-panel");

    leftPanel.style.transition = `transform ${DOOR_ANIMATION_DURATION}ms`;
    rightPanel.style.transition = `transform ${DOOR_ANIMATION_DURATION}ms`;
    leftPanel.style.transform = "translateX(-32px)";
    rightPanel.style.transform = "translateX(32px)";

    this.doorsOpen = true;
    console.log(`${this.id} doors opened`);
  }

  closeDoor() {
    if (!this.doorsOpen || this.isMoving) return;

    const leftPanel = this.doorElement.querySelector(".left-panel");
    const rightPanel = this.doorElement.querySelector(".right-panel");

    leftPanel.style.transition = `transform ${DOOR_ANIMATION_DURATION}ms`;
    rightPanel.style.transition = `transform ${DOOR_ANIMATION_DURATION}ms`;
    leftPanel.style.transform = "translateX(0)";
    rightPanel.style.transform = "translateX(0)";

    this.doorsOpen = false;
    console.log(`${this.id} doors closed`);
  }

  moveToFloor() {
    if (this.currentFloor === this.targetFloor || this.isMoving) return;

    this.isMoving = true;
    const floorsToMove = Math.abs(this.targetFloor - this.currentFloor);
    const totalTravelTime = floorsToMove * TRAVEL_TIME_PER_FLOOR;
    const steps = totalTravelTime / UPDATE_INTERVAL;
    const floorStep = (this.targetFloor - this.currentFloor) / steps;
    let currentStep = 0;

    this.doorElement.style.transition = `bottom ${totalTravelTime}ms linear`;
    const newBottomPosition = (this.targetFloor - 1) * FLOOR_HEIGHT;
    this.doorElement.style.bottom = `${newBottomPosition}px`;

    const interval = setInterval(() => {
      currentStep++;
      this.currentFloor += floorStep;
      this.updateDisplay();

      if (currentStep >= steps) {
        clearInterval(interval);
        this.currentFloor = this.targetFloor;
        this.isMoving = false;
        this.pendingDirection = null;
        console.log(`${this.id} reached floor ${this.currentFloor}`);
      }
    }, UPDATE_INTERVAL);

    setTimeout(() => {
      if (Math.round(this.currentFloor) === this.targetFloor) {
        this.openDoor();
        setTimeout(() => this.closeDoor(), DOOR_ANIMATION_DURATION);
      }
    }, totalTravelTime);
  }

  setDirection(direction) {
    if (this.isMoving || this.doorsOpen) return;

    if (direction === "up" && this.currentFloor >= TOTAL_FLOORS) return;
    if (direction === "down" && this.currentFloor <= 1) return;

    this.pendingDirection = direction;
    this.openDoor();
    console.log(`${this.id} set to move ${direction}`);
  }

  updateDisplay() {
    if (this.controlPanel) {
      this.controlPanel.querySelector(
        ".display"
      ).textContent = `Floor: ${Math.round(this.currentFloor)}`;
    }
  }

  selectFloor(floor) {
    if (floor < 1 || floor > TOTAL_FLOORS) return;

    if (!this.pendingDirection) {
      console.log(`${this.id}: No pending direction, ignoring floor ${floor}`);
      return;
    }

    this.targetFloor = floor;
    if (
      (this.pendingDirection === "up" &&
        this.targetFloor <= this.currentFloor) ||
      (this.pendingDirection === "down" &&
        this.targetFloor >= this.currentFloor)
    ) {
      this.pendingDirection = null;
      console.log(
        `${this.id}: Invalid floor ${floor} for ${this.pendingDirection}`
      );
      return;
    }

    this.closeDoor();
    setTimeout(() => {
      this.moveToFloor();
      console.log(`${this.id} moving to floor ${floor}`);
    }, DOOR_ANIMATION_DURATION);
  }

  initialize() {
    this.doorElement.style.bottom = "0px";
    this.updateDisplay();
  }
}
