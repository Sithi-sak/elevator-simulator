// Elevator state objects
let elevatorLeft = {
  currentFloor: 1,
  targetFloor: 1,
  direction: "none",
  isMoving: false,
  doorsOpen: false,
  pendingDirection: null,
};

let elevatorRight = {
  currentFloor: 1,
  targetFloor: 1,
  direction: "none",
  isMoving: false,
  doorsOpen: false,
  pendingDirection: null,
};

// Constants for elevator movement and timing
const FLOOR_HEIGHT = 112; // Each floor is 112px tall (896px total height / 8 floors)
const DOOR_ANIMATION_DURATION = 500; // 500ms for door open/close animation
const TRAVEL_TIME_PER_FLOOR = 500; // 500ms per floor for movement
const UPDATE_INTERVAL = 50; // Update display every 50ms for smoother animation
const TOTAL_FLOORS = 8; // Total number of floors

// Function to open elevator doors
function openDoor(elevator) {
  const elevatorObj = elevator === "left" ? elevatorLeft : elevatorRight;
  if (elevatorObj.doorsOpen || elevatorObj.isMoving) return;

  const doorElement = document.querySelector(`.${elevator}-door`);
  const leftPanel = doorElement.querySelector(".left-panel");
  const rightPanel = doorElement.querySelector(".right-panel");

  leftPanel.style.transition = `transform ${DOOR_ANIMATION_DURATION}ms`;
  rightPanel.style.transition = `transform ${DOOR_ANIMATION_DURATION}ms`;
  leftPanel.style.transform = "translateX(-32px)";
  rightPanel.style.transform = "translateX(32px)";

  elevatorObj.doorsOpen = true;
}

// Function to close elevator doors
function closeDoor(elevator) {
  const elevatorObj = elevator === "left" ? elevatorLeft : elevatorRight;
  if (!elevatorObj.doorsOpen || elevatorObj.isMoving) return;

  const doorElement = document.querySelector(`.${elevator}-door`);
  const leftPanel = doorElement.querySelector(".left-panel");
  const rightPanel = doorElement.querySelector(".right-panel");

  leftPanel.style.transition = `transform ${DOOR_ANIMATION_DURATION}ms`;
  rightPanel.style.transition = `transform ${DOOR_ANIMATION_DURATION}ms`;
  leftPanel.style.transform = "translateX(0)";
  rightPanel.style.transform = "translateX(0)";

  elevatorObj.doorsOpen = false;
}

// Function to move the elevator to a specific floor with incremental display
function moveElevatorToFloor(elevator) {
  const elevatorObj = elevator === "left" ? elevatorLeft : elevatorRight;
  if (
    elevatorObj.currentFloor === elevatorObj.targetFloor ||
    elevatorObj.isMoving
  )
    return;

  elevatorObj.isMoving = true;
  const floorsToMove = Math.abs(
    elevatorObj.targetFloor - elevatorObj.currentFloor
  );
  const totalTravelTime = floorsToMove * TRAVEL_TIME_PER_FLOOR;
  const steps = totalTravelTime / UPDATE_INTERVAL;
  const floorStep =
    (elevatorObj.targetFloor - elevatorObj.currentFloor) / steps;
  let currentStep = 0;

  const doorElement = document.querySelector(`.${elevator}-door`);
  doorElement.style.transition = `bottom ${totalTravelTime}ms linear`;
  const newBottomPosition = (elevatorObj.targetFloor - 1) * FLOOR_HEIGHT;
  doorElement.style.bottom = `${newBottomPosition}px`;

  const interval = setInterval(() => {
    currentStep++;
    elevatorObj.currentFloor += floorStep;
    updateDisplay(elevator);

    if (currentStep >= steps) {
      clearInterval(interval);
      elevatorObj.currentFloor = elevatorObj.targetFloor;
      elevatorObj.isMoving = false;
      elevatorObj.pendingDirection = null; // Reset pending direction
    }
  }, UPDATE_INTERVAL);

  setTimeout(() => {
    if (Math.round(elevatorObj.currentFloor) === elevatorObj.targetFloor) {
      openDoor(elevator);
      setTimeout(() => {
        closeDoor(elevator);
      }, DOOR_ANIMATION_DURATION);
    }
  }, totalTravelTime);
}

// Function to handle up/down button press
function moveElevator(elevator, direction) {
  const elevatorObj = elevator === "left" ? elevatorLeft : elevatorRight;

  if (elevatorObj.isMoving || elevatorObj.doorsOpen) return;

  if (direction === "up" && elevatorObj.currentFloor >= TOTAL_FLOORS) {
    return; // Already at top
  } else if (direction === "down" && elevatorObj.currentFloor <= 1) {
    return; // Already at bottom
  }

  elevatorObj.pendingDirection = direction;
  openDoor(elevator); // Open doors to indicate readiness
}

// Function to update the floor display
function updateDisplay(elevator) {
  const elevatorObj = elevator === "left" ? elevatorLeft : elevatorRight;
  const controlPanel = document.querySelector(`.${elevator}-control`);
  if (controlPanel) {
    controlPanel.querySelector(".display").textContent = `Floor: ${Math.round(
      elevatorObj.currentFloor
    )}`;
  }
}

// Function to handle floor button clicks
function handleFloorButtonClick(elevator, floor) {
  const elevatorObj = elevator === "left" ? elevatorLeft : elevatorRight;

  if (floor < 1 || floor > TOTAL_FLOORS) return;

  if (!elevatorObj.pendingDirection) {
    return; // Do nothing if up/down hasn't been pressed
  }

  elevatorObj.targetFloor = floor;

  if (
    (elevatorObj.pendingDirection === "up" &&
      elevatorObj.targetFloor <= elevatorObj.currentFloor) ||
    (elevatorObj.pendingDirection === "down" &&
      elevatorObj.targetFloor >= elevatorObj.currentFloor)
  ) {
    elevatorObj.pendingDirection = null; // Reset if invalid
    return;
  }

  closeDoor(elevator);
  setTimeout(() => {
    moveElevatorToFloor(elevator);
  }, DOOR_ANIMATION_DURATION);
}

// Add event listeners to floor buttons
document.querySelectorAll(".control-panel").forEach((panel) => {
  const elevator = panel.classList.contains("left-control") ? "left" : "right";
  const floorButtons = panel.querySelectorAll("button[data-floor]");

  floorButtons.forEach((button) => {
    const floor = parseInt(button.getAttribute("data-floor"));
    button.addEventListener("click", () => {
      console.log(`Floor button ${floor} clicked for ${elevator}`); // Debug log
      handleFloorButtonClick(elevator, floor);
    });
  });
});

// Initialize elevators
const leftDoorElement = document.querySelector(".left-door");
const rightDoorElement = document.querySelector(".right-door");
leftDoorElement.style.bottom = "0px"; // Floor 1
rightDoorElement.style.bottom = "0px"; // Floor 1
updateDisplay("left");
updateDisplay("right");
