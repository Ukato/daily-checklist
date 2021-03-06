// declare UI Variables
const currentDate = document.querySelector('#current-date');
const currentTime = document.querySelector('#current-time');
const clockIcon = document.querySelector('#header-clock');
const inputArea = document.querySelector('#input-area');
const taskInput = document.querySelector('#task-input');
const taskInputLabel = document.querySelector('[for=task-input]');
const unfoldSelect = document.querySelector('#unfold-select');
const highPriority = document.querySelector('#highp-btn');
const mediumPriority = document.querySelector('#mediump-btn');
const lowPriority = document.querySelector('#lowp-btn');
const priorityLevelLabel = document.querySelector('[for=priority-level]');
const ttlLabel = document.querySelector('[for=ttl]');
const ttl = document.querySelector('#ttl');
const ttlLeft = document.querySelector('#ttl-left');
const ttlRight = document.querySelector('#ttl-right');
const addArrow = document.querySelector('#add-arrow');
const itemList = document.querySelector('#active-tasks');
const archive = document.querySelector('#archive');

const lightbulb = document.querySelector('#light-theme');

// load all Event Listeners
loadEventListeners();

function loadEventListeners() {
  // DOM Load event
  document.addEventListener('DOMContentLoaded', getStoredTasks);
  // Show/Hide Time
  clockIcon.addEventListener('click', timeDisplay);
  // Change color theme
  lightbulb.addEventListener('click', changeColors);
  // react to user input at task input
  taskInput.addEventListener('focus', showTaskInput);
  taskInput.addEventListener('blur', hideTaskInput);
  // react to user input on priority selector
  priorityLevelLabel.addEventListener('click', showLevels);
  highPriority.addEventListener('click', setPriorityHigh);
  mediumPriority.addEventListener('click', setPriorityMedium);
  lowPriority.addEventListener('click', setPriorityLow);
  // allow user to click arrow to add new goal/task
  addArrow.addEventListener('click', addNewTask);

  // Listen for TTL events and set up TTL Array of options
  ttlLabel.addEventListener('click', showTTL);
  ttlLeft.addEventListener('click', shiftTTLLeft);
  ttlRight.addEventListener('click', shiftTTLRight);

  // allow user to add item by pressing enter
  taskInput.addEventListener('keydown', function(event) {
    // call addNewTask if user hits enter
    if(event.keyCode === 13) {
      event.preventDefault();
      addNewTask();
    } else if(taskInput.value.length > 1) {
      showArrow();
    } else {
      hideArrow();
    }
  });

  // listen for user to click inside the active items list
  itemList.addEventListener('click', function(event) {

    // remove item from active when checked and place in archive
    if(event.target.parentElement.classList.contains('checkbox')) {
      // animate the checking action
      event.target.classList += ' checked';

      // if item has a ttl then just deactivate it
      if(event.target.parentElement.parentElement.children[2].lastChild.value !== 0) {
        setTimeout(function() {event.target.parentElement.classList = 'deactivated-checkbox';}, 2000);
        setTimeout(updateTTLStatus, 2100);
      } else {
        // close out the entry visually
        event.target.parentElement.parentElement.classList += ' blip-out';
        // wait for checking animation to complete and then remove and add item to archive
        setTimeout(function() {archiveTask(event.target.parentElement.nextElementSibling.innerHTML)}, 2000);
        setTimeout(function() {event.target.parentElement.parentElement.remove()}, 2000);
        // remove item from local storage
        flushLocalStorage(event.target.parentElement.nextElementSibling.innerHTML);
      }
      
    };

    // listen for user to click the edit icon
    if(event.target.classList.contains('pencil-icon')) {
      enterEditMode(event.target.parentElement.parentElement);
      flushLocalStorage(event.target.parentElement.parentElement.children[1].value);
    };

    // listen for the user to click the delete icon
    if(event.target.classList.contains('delete-icon')) {
      // remove item from local storage
      flushLocalStorage(event.target.parentElement.parentElement.children[1].value);
      event.target.parentElement.parentElement.remove();
    };

    // listen for the user to click the save icon
    if(event.target.classList.contains('save-icon')) {
      saveChanges(event.target.parentElement.parentElement);
    };

    // listen for user to change priority to high
    if(event.target.classList.contains('change-high')) {
      event.target.parentElement.parentElement.classList = 'high-p active-item';
    };

    // listen for user to change priority to normal
    if(event.target.classList.contains('change-normal')) {
      event.target.parentElement.parentElement.classList = 'medium-p active-item';
    };

    // listen for user to change priority to low
    if(event.target.classList.contains('change-low')) {
      event.target.parentElement.parentElement.classList = 'low-p active-item';
    };

    // listen for user to click ttl up arrow
    if(event.target.classList.contains('item-ttl-up')) {
      setItemTTL(-1, event.target.parentElement.children[1])
    };

    // listen for user to click ttl down arrow
    if(event.target.classList.contains('item-ttl-down')) {
      setItemTTL(1, event.target.parentElement.children[1])
    };
  });  
}

// Allow user to edit an active item
function enterEditMode(activeItem) {
  // fill the edit ttl section with 'off' if item has no current ttl
  if(activeItem.children[2].lastChild.innerHTML === '') {
    activeItem.children[2].lastChild.innerHTML = 'Off';
  }

  const li = document.createElement('li');
  li.classList = activeItem.classList;
  li.innerHTML = `
    <div class="priority-change">
      <img class="change-high" src="img/changeHigh-100.png" alt="red arrow" title="Change priority to high">
      <img class="change-normal" src="img/changeNormal-100.png" alt="white arrow" title="Change priority to normal">
      <img class="change-low" src="img/changeLow-100.png" alt="green arrow" title="Change priority to low">
    </div>
    <textarea type="text" class="description-edit">${activeItem.children[1].innerHTML}</textarea>
    <span class="ttl-edit">
      <img class="item-ttl-up" src="img/Arrowhead-Down-100.png" alt="up-arrow">
      <div class="active-item-ttl" name="ttl"><span>${activeItem.children[2].innerHTML}</span></div>
      <img class="item-ttl-down" src="img/Arrowhead-Down-100.png" alt="down-arrow">
    </span>
    <div class="edit-icon">
      <img class="save-icon" src="img/Save-100.png" alt="floppy save icon" title="Save Goal">
      <img class="delete-icon" src="img/Garbage-100.png" alt="garbage can icon" title="Delete Goal">
    </div>
  `;

  // store values in newly made elements
  li.children[0].value = activeItem.children[0].classList.value;
  li.children[0].children[1].value = activeItem.children[0].children[1].classList.value;
  li.children[1].value = activeItem.children[1].value;
  li.children[2].children[1].value = activeItem.children[2].value;
  li.children[2].children[1].children[0].value = activeItem.children[2].lastChild.value;

  activeItem.parentElement.replaceChild(li, activeItem);

}

// -------------------------------------------------------------------------------
// remove active entries from local storage
function flushLocalStorage(removeItem) {
  let active;
  if(localStorage.getItem('active') === null) {
    active = [];
  } else {
    active = JSON.parse(localStorage.getItem('active'));
  }

  active.forEach(function(item, index) {
    if(item.description === removeItem) {
      active.splice(index, 1);
    }
  });

  localStorage.setItem('active', JSON.stringify(active));
}

// -------------------------------------------------------------------------------
// Allow user to archive an active item/task
function archiveTask(task) {
  const li = document.createElement('li');
  li.classList = 'archive-item';
  const timestamp = setDateTime();
  const variables = {
    description: task,
    time: timestamp
  };

  li.innerHTML = `
    <p class="item-description">${task}</p>
    <div class="time-completed">${timestamp}</div>
    <div class="completed-flag">
      <img src="img/Race-Flag-100.png" alt="green waving race flag">
    </div>
  `;

  if(archive.childNodes) {
    archive.insertBefore(li, archive.childNodes[0]);
  } else {
    archive.appendChild(li);
  }

  // persist archived item to local storage
  storeArchived(variables);
}

// -------------------------------------------------------------------------------
// Allow user to save currently editing item
function saveChanges(item) {
  li = document.createElement('li');
  const taskDescript = item.children[1].value;
  // getting value from priority input
  let priorityValue;
  if(item.classList.contains('high-p')) {
    priorityValue = 'high-p';
  } else if(item.classList.contains('medium-p')) {
    priorityValue = 'medium-p';
  } else if(item.classList.contains('low-p')) {
    priorityValue = 'low-p';
  }

  // creating ttl output and timer
  const d = new Date();
  currentd = d.getTime();
  let twentyFourHours = currentd + 86400000,
      sevenDays = currentd + 604800000,
      thirtyDays = currentd + 2592000000;
      eod = currentd + ((24 - d.getHours()) * 3600000) - (d.getMinutes() * 60000),
      eow = currentd + ((7 - d.getDay()) * 86400000) - ((d.getHours()) * 3600000) - (d.getMinutes() * 60000), 
      eom = currentd + ((31 - d.getDate()) * 86400000) - ((d.getHours()) * 3600000) - (d.getMinutes() * 60000);


  let ttlTimeouts = {
    1: 0,
    2: twentyFourHours,
    3: sevenDays,
    4: thirtyDays,
    5: eod,
    6: eow,
    7: eom
  };

  const ttlArray = setTTL();
  let ttlValue;
  let dueText;
  if(item.children[2].children[1].children[0].value <= 7) {
    if(item.children[2].children[1].value !== 1) {
      ttlValue = ttlArray[item.children[2].children[1].value];
      if(item.children[2].children[1].value < 5) {
        dueText = 'Due in <br>';
      } else {
        dueText = 'Due by <br>';
      }
    } else {
      ttlValue = '';
      dueText = '';
    }
  } else {
    dueText = item.children[2].children[1].children[0].firstChild.data + ' <br>';
    ttlValue = item.children[2].children[1].children[0].children[1].innerHTML;
  }

  const attributes = {
    priority: priorityValue,
    description: taskDescript,
    due: dueText,
    ttl: ttlValue,
    index: item.children[2].children[1].value,
    timer: item.children[2].children[1].lastChild.value,
    checkstate: item.children[0].value,
    checkmarkstate: item.children[0].children[1].value
  };

  if(item.children[2].children[1].value === 1) {
    attributes.checkstate = 'checkbox';
    attributes.checkmarkstate = 'checkbox-check';
  }

  li.classList = `${priorityValue} active-item`;
  
  li.innerHTML = `
    <div class="${attributes.checkstate}">
      <img class="checkbox-box" src="img/Shape-Square-100.png" alt="square checkbox">
      <img class="${attributes.checkmarkstate}" src="img/Check-100.png" alt="lefthanded checkmark" title="Mark as complete">
    </div>
    <p class="item-description">${taskDescript}</p>
    <span class="ttl-active">${dueText}<span>${ttlValue}</span></span>
    <div class="edit-icon">
      <img class="pencil-icon" src="img/Pencil-100.png" alt="pencil edit icon" title="Edit Goal">
    </div>
  `;

  // store values in elements so edit state can use them
  li.children[0].value = attributes.checkstate;
  li.children[1].value = taskDescript;
  li.children[2].value = item.children[2].children[1].value;
  if(item.children[2].children[1].lastChild.value !== 1) {
    li.children[2].lastChild.value = item.children[2].children[1].lastChild.value;
  } else {
    li.children[2].lastChild.value = ttlTimeouts[attributes.index];
    attributes.timer = ttlTimeouts[attributes.index];
  }

  // persist new item to local storage
  storeActive(attributes);

  item.parentElement.replaceChild(li, item);
}

// -------------------------------------------------------------------------------
// Add new task/goal to the active list
function addNewTask() {
  const li = document.createElement('li');
  const taskDescript = taskInput.value;
  // getting value from priority input
  const priorityValue = unfoldSelect.value;

  // creating ttl output and timer
  const d = new Date();
  currentd = d.getTime();
  let twentyFourHours = currentd + 86400000,
      sevenDays = currentd + 604800000,
      thirtyDays = currentd + 2592000000;
      eod = currentd + ((24 - d.getHours()) * 3600000) - (d.getMinutes() * 60000),
      eow = currentd + ((7 - d.getDay()) * 86400000) - ((d.getHours()) * 3600000) - (d.getMinutes() * 60000), 
      eom = currentd + ((31 - d.getDate()) * 86400000) - ((d.getHours()) * 3600000) - (d.getMinutes() * 60000);

  let ttlTimeouts = {
    1: 0,
    2: twentyFourHours,
    3: sevenDays,
    4: thirtyDays,
    5: eod,
    6: eow,
    7: eom
  };

  const ttlArray = setTTL();
  let ttlValue;
  let dueText;
  if(ttl.value !== 1) {
    ttlValue = ttlArray[ttl.value];
    if(ttl.value < 5) {
      dueText = 'Due in <br>';
    } else {
      dueText = 'Due by <br>';
    }
  } else {
    ttlValue = '';
    dueText = '';
  }

  const attributes = {
    priority: priorityValue,
    description: taskDescript,
    due: dueText,
    ttl: ttlValue,
    index: ttl.value,
    timer: ttlTimeouts[ttl.value],
    checkstate: 'checkbox',
    checkmarkstate: 'checkbox-check'
  };

  li.classList = `${priorityValue} active-item`;
  
  li.innerHTML = `
    <div class="${attributes.checkstate}">
      <img class="checkbox-box" src="img/Shape-Square-100.png" alt="square checkbox">
      <img class="${attributes.checkmarkstate}" src="img/Check-100.png" alt="lefthanded checkmark" title="Mark as complete">
    </div>
    <p class="item-description">${taskDescript}</p>
    <span class="ttl-active">${dueText}<span>${ttlValue}</span></span>
    <div class="edit-icon">
      <img class="pencil-icon" src="img/Pencil-100.png" alt="pencil edit icon" title="Edit Goal">
    </div>
  `;

  // store values in elements so edit state can use them
  li.children[0].value = attributes.checkstate;
  li.children[1].value = taskDescript;
  li.children[2].value = ttl.value;
  li.children[2].lastChild.value = ttlTimeouts[ttl.value];

  if(taskDescript === '') {
    taskInput.classList = 'required';
    setTimeout(removeRequired, 1000);
  } else {
    itemList.appendChild(li);
    taskInput.value = '';
    hideArrow();
  }

  // persist new item to local storage
  storeActive(attributes);
}

// Store task in local storage
function storeActive(item) {
  let active;
  if(localStorage.getItem('active') === null) {
    active = [];
  } else {
    active = JSON.parse(localStorage.getItem('active'));
  }

  active.push(item);

  localStorage.setItem('active', JSON.stringify(active));
}

// Store archived item to local storage
function storeArchived(item) {
  let archive;
  if(localStorage.getItem('archive') === null) {
    archive = [];
  } else {
    archive = JSON.parse(localStorage.getItem('archive'));
  }

  archive.push(item);

  localStorage.setItem('archive', JSON.stringify(archive));
}

// load all locally stored data
function getStoredTasks() {
  getStoredActive();
  getStoredArchive();
}

// Retrieve tasks from local storage and place them in UI
function getStoredActive() {

  let active;
  
  if(localStorage.getItem('active') === null) {
    // default tasks for new user welcome messages
    active = [{"priority":"medium-p","description":"Add my first task, goal, or to-do to CheckLister","due":"  <br>","ttl":"","index":1,"timer":0,"checkstate":"checkbox","checkmarkstate":"checkbox-check"},{"priority":"medium-p","description":"Use a TTL, or Time To Live, for tasks that reoccur regularly","due":"Due in  <br>","ttl":"24 hours","index":2,"timer":1611867993868,"checkstate":"checkbox","checkmarkstate":"checkbox-check"},{"priority":"high-p","description":"Leave CheckLister open as a tab, or pinned tab, in my browser for easy reference throughout the day","due":" <br>","ttl":"","index":1,"timer":0,"checkstate":"checkbox","checkmarkstate":"checkbox-check"},{"priority":"medium-p","description":"After checking off a few items scroll down to see an archive of my past accomplishments","due":"","ttl":"","index":1,"timer":0,"checkstate":"checkbox","checkmarkstate":"checkbox-check"},{"priority":"low-p","description":"Say hi or send feedback to hello@checklister.io","due":"","ttl":"","index":1,"timer":0,"checkstate":"checkbox","checkmarkstate":"checkbox-check"}];
  } else {
    active = JSON.parse(localStorage.getItem('active'));
  }

  active.forEach(function(item) {
    const li = document.createElement('li');
    li.classList = `${item.priority} active-item`;

    li.innerHTML = `
      <div class="${item.checkstate}">
        <img class="checkbox-box" src="img/Shape-Square-100.png" alt="square checkbox">
        <img class="${item.checkmarkstate}" src="img/Check-100.png" alt="lefthanded checkmark" title="Mark as complete">
      </div>
      <p class="item-description">${item.description}</p>
      <span class="ttl-active">${item.due}<span>${item.ttl}</span></span>
      <div class="edit-icon">
        <img class="pencil-icon" src="img/Pencil-100.png" alt="pencil edit icon" title="Edit Goal">
      </div>
    `;

    // store values in elements so edit state can use them
    li.children[0].value = item.checkstate;
    li.children[1].value = item.description;
    li.children[2].value = item.index;
    li.children[2].lastChild.value = item.timer;

    itemList.appendChild(li);

  });

  updateTTLStatus();
}

// Retrieve archived tasks/goals that have been checked off the active list
function getStoredArchive() {
  let storedArchive;
  if(localStorage.getItem('archive') === null) {
    storedArchive = [];
  } else {
    storedArchive = JSON.parse(localStorage.getItem('archive'));

    storedArchive.forEach(function(item) {
      const li = document.createElement('li');
      li.classList = 'archive-item';
      const timestamp = item.time;

      li.innerHTML = `
        <p class="item-description">${item.description}</p>
        <div class="time-completed">${timestamp}</div>
        <div class="completed-flag">
          <img src="img/Race-Flag-100.png" alt="green waving race flag">
        </div>
      `;

      if(archive.childNodes) {
        archive.insertBefore(li, archive.childNodes[0]);
      } else {
        archive.appendChild(li);
      }
    });
  }
}

// remove required class from input
function removeRequired() {
  taskInput.classList = '';
}

// -------------------------------------------------------------------------------
// Allow user to cycle through TTL Options

// Top TTL Input
function shiftTTLLeft() {
  setTTL(-1);
  if(ttl.value === 1) {
    setTimeout(closeTTL, 3000);
  }
}

function shiftTTLRight() {
  setTTL(1);
  if(ttl.value === 1) {
    setTimeout(closeTTL, 3000);
  }
}

function showTTL() {
  ttlLabel.classList = 'form-label show-ttl';
  ttl.classList = 'fade-in';
  ttlLeft.classList = 'fade-in';
  ttlRight.classList = 'fade-in';
  setTimeout(closeTTL, 5000);
}

function closeTTL() {
  if(ttl.value === 1) {
    ttlLabel.classList = 'form-label close-ttl';
    ttl.classList = 'fade-out';
    ttlLeft.classList = 'fade-out';
    ttlRight.classList = 'fade-out';
  }
}

function setTTL(ttlShift) {
  const ttlOptions = {
    1: 'Off',
    2: '24 Hours',
    3: '7 Days',
    4: '30 Days',
    5: 'End of Day',
    6: 'End of Week',
    7: 'End of Month'
  };

  if(ttl.innerHTML === '') {
    ttl.innerHTML = ttlOptions[ttlShift];
    ttl.value = ttlShift;
  } else {
    if(ttlShift === 1) {
      if(ttl.value === Object.keys(ttlOptions).length) {
        ttl.innerHTML = ttlOptions[ttlShift];
        ttl.value = ttlShift;
      } else {
        ttl.innerHTML = ttlOptions[ttl.value + ttlShift];
        ttl.value++;
      }
    } else if(ttlShift === -1) {
      if(ttl.value === 1) {
        ttl.innerHTML = ttlOptions[Object.keys(ttlOptions).length];
        ttl.value = Object.keys(ttlOptions).length;
      } else {
        ttl.innerHTML = ttlOptions[ttl.value + ttlShift];
        ttl.value--;
      }
    }
  }
  return ttlOptions;
}

setTTL(1);

// active item edit mode TTL
function setItemTTL(ttlShift, ttlElement) {
  const ttlOptions = {
    1: 'Off',
    2: '24 Hours',
    3: '7 Days',
    4: '30 Days',
    5: 'End of Day',
    6: 'End of Week',
    7: 'End of Month'
  };

  if(ttlShift === 1) {
    if(ttlElement.value === Object.keys(ttlOptions).length) {
      ttlElement.children[0].innerHTML = ttlOptions[ttlShift];
      ttlElement.value = ttlShift;
    } else {
      ttlElement.children[0].innerHTML = ttlOptions[ttlElement.value + ttlShift];
      ttlElement.value++;
    }
  } else if(ttlShift === -1) {
    if(ttlElement.value === 1) {
      ttlElement.children[0].innerHTML = ttlOptions[Object.keys(ttlOptions).length];
      ttlElement.value = Object.keys(ttlOptions).length;
    } else {
      ttlElement.children[0].innerHTML = ttlOptions[ttlElement.value + ttlShift];
      ttlElement.value--;
    }
  }

  ttlElement.children[0].value = 1;
}

// -------------------------------------------------------------------------------
// grab current date and set it in the UI
function setDateTime() {
  const d = new Date();
  const date = formatDate(d);
  const time = formatTime(d);

  // keep from updating the html page unless necessary
  if(currentDate.innerHTML !== date) {
    currentDate.innerHTML = date;
  }
  if(currentTime.innerHTML !== time) {
    currentTime.innerHTML = time;
  }

  return `${date} ${time}`;
}

// set initial date
setDateTime();
// set date and time every second to keep time on track
setInterval(setDateTime, 1000);

// run through active items and update their ttl values
function updateTTLStatus() {
  document.querySelectorAll('.active-item').forEach(function(item) {
    // capture ttl type
    const itemTTLType = item.children[2].value;
    let itemTTL = item.children[2].lastChild.value;
    
    // move on to next time if it has no ttl, ie value is 1
    if(itemTTLType !== 1 && item.children[3].classList.contains('edit-icon')) {
      let d = new Date();
      const currentd = d.getTime();

      // first check to see if the ttl of the item is past, and if so reset it
      if(currentd > itemTTL) {
        item.children[0].classList.value = 'checkbox';
        item.children[0].children[1].classList.value = 'checkbox-check';

        // define new ttl times to reset current items ttl
        let twentyFourHours = currentd + 86400000,
        sevenDays = currentd + 604800000,
        thirtyDays = currentd + 2592000000;
        eod = currentd + ((24 - d.getHours()) * 3600000) - (d.getMinutes() * 60000),
        eow = currentd + ((7 - d.getDay()) * 86400000) - ((d.getHours()) * 3600000) - (d.getMinutes() * 60000), 
        eom = currentd + ((31 - d.getDate()) * 86400000) - ((d.getHours()) * 3600000) - (d.getMinutes() * 60000);

        let ttlTimeouts = {
          1: 0,
          2: twentyFourHours,
          3: sevenDays,
          4: thirtyDays,
          5: eod,
          6: eow,
          7: eom
        };

        itemTTL = ttlTimeouts[itemTTLType];
        item.children[2].lastChild.value = itemTTL;

        // reset ttl text as well
        if(itemTTLType < 5) {
          item.children[2].firstChild.data = 'Due in';
        } else {
          item.children[2].firstChild.data = 'Due by';
        }

        // reset text color on items past due and haven't been checked off
        item.children[2].lastChild.style.color = 'var(--foreground-color)';

        if(itemTTLType === 2) {
          item.children[2].lastChild.innerHTML = `24 hours`;
        } else if(itemTTLType === 3) {
          item.children[2].lastChild.innerHTML = `7 days`;
        } else if(itemTTLType === 4) {
          item.children[2].lastChild.innerHTML = `30 days`;
        }

      } else if(item.children[0].classList.value === 'deactivated-checkbox'){
        if(itemTTLType < 5) {
          item.children[2].firstChild.data = 'Resets in';
        } else {
          item.children[2].firstChild.data = 'Resets at';
        }
        item.children[2].lastChild.style.color = 'var(--foreground-color)';
      }

      // updates for 24 hour ttl
      if(itemTTLType === 2) {
        let updatedTime = Math.trunc((itemTTL - currentd) / 3600000 + 1);
        console.log(`Updated time for 24 hour TTL: ${updatedTime}`);
        if(updatedTime === 1) {
          item.children[2].lastChild.innerHTML = `less than an hour`;
        } else if(updatedTime === 25) {
          item.children[2].lastChild.innerHTML = `24 hours`;
        } else {
          item.children[2].lastChild.innerHTML = `${updatedTime} hours`;
        }
        
        if(updatedTime <= 4 && item.children[0].classList.value !== 'deactivated-checkbox') {
          item.children[2].lastChild.style.color = 'var(--high-priority)';
        }
      }

      // updates for 7 day ttl
      if(itemTTLType === 3) {
        let updatedTime = Math.trunc((itemTTL - currentd) / 86400000 + 1);
        if(updatedTime === 0) {
          item.children[2].lastChild.innerHTML = `less than a day`;
        } else if(updatedTime === 8) {
          item.children[2].lastChild.innerHTML = `7 days`;
        } else {
          item.children[2].lastChild.innerHTML = `${updatedTime} days`;
        }

        if(updatedTime <= 2 && item.children[0].classList.value !== 'deactivated-checkbox') {
          item.children[2].lastChild.style.color = 'var(--high-priority)';
        }
      }

      // updates for 30 day ttl
      if(itemTTLType === 4) {
        let updatedTime = Math.trunc((itemTTL - currentd) / 86400000 + 1);
        if(updatedTime === 0) {
          item.children[2].lastChild.innerHTML = `less than a day`;
        } else if(updatedTime === 31) {
          item.children[2].lastChild.innerHTML = `30 days`;
        } else {
          item.children[2].lastChild.innerHTML = `${updatedTime} days`;
        }

        if(updatedTime <= 5 && item.children[0].classList.value !== 'deactivated-checkbox') {
          item.children[2].lastChild.style.color = 'var(--high-priority)';
        }
      }

      if(itemTTLType === 5 && itemTTL - currentd < 14400000 && item.children[0].classList.value !== 'deactivated-checkbox') {
        item.children[2].lastChild.style.color = 'var(--high-priority)';
      } else if(itemTTLType === 6 && itemTTL - currentd < 86400000 && item.children[0].classList.value !== 'deactivated-checkbox') {
        item.children[2].lastChild.style.color = 'var(--high-priority)';
      } else if(itemTTLType === 7 && itemTTL - currentd < 432000000 && item.children[0].classList.value !== 'deactivated-checkbox') {
        item.children[2].lastChild.style.color = 'var(--high-priority)';
      }
    }

    if(!item.children[2].firstChild.data) {
      item.children[2].firstChild.data = '';
    }

    const attributes = {
      due: item.children[2].firstChild.data + ' <br>',
      ttl: item.children[2].lastChild.innerHTML,
      description: item.children[1].value,
      timer: itemTTL,
      checkstate: item.children[0].classList.value,
      checkmarkstate: item.children[0].children[1].classList.value
    };

    updateLocalStorage(attributes);
    
  });
}

// update ttl status every 5 minutes
setInterval(updateTTLStatus, 300000);

// -------------------------------------------------------------------------------
// update items attributes in local storage
function updateLocalStorage(item) {
  let active;
  if(localStorage.getItem('active') === null) {
    active = [{"priority":"medium-p","description":"Add my first task, goal, or to-do to CheckLister","due":"  <br>","ttl":"","index":1,"timer":0,"checkstate":"checkbox","checkmarkstate":"checkbox-check"},{"priority":"medium-p","description":"Use a TTL, or Time To Live, for tasks that reoccur regularly","due":"Due in  <br>","ttl":"24 hours","index":2,"timer":1611867993868,"checkstate":"checkbox","checkmarkstate":"checkbox-check"},{"priority":"high-p","description":"Leave CheckLister open as a tab, or pinned tab, in my browser for easy reference throughout the day","due":" <br>","ttl":"","index":1,"timer":0,"checkstate":"checkbox","checkmarkstate":"checkbox-check"},{"priority":"medium-p","description":"After checking off a few items scroll down to see an archive of my past accomplishments","due":"","ttl":"","index":1,"timer":0,"checkstate":"checkbox","checkmarkstate":"checkbox-check"},{"priority":"low-p","description":"Say hi or send feedback to hello@checklister.io","due":"","ttl":"","index":1,"timer":0,"checkstate":"checkbox","checkmarkstate":"checkbox-check"}];
  } else {
    active = JSON.parse(localStorage.getItem('active'));
  }

  active.forEach(function(stored) {
    if(item.description === stored.description) {
      stored.due = item.due;
      stored.ttl = item.ttl;
      stored.timer = item.timer;
      stored.checkstate = item.checkstate;
      stored.checkmarkstate = item.checkmarkstate;
    }
  });

  localStorage.setItem('active', JSON.stringify(active));
}

// -------------------------------------------------------------------------------
// convert date to custom format
function formatDate(date) {

  // define object for converting weekdays to names
  const weekDays = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday'
  };

  // formatting for day of the month
  const monthDays = {
    1: `<sup>st</sup>`,
    2: `<sup>nd</sup>`,
    3: `<sup>rd</sup>`,
    4: `<sup>th</sup>`,
  };

  // applying the proper superscript based on the day
  let day = date.getDate();

  if(day === 1 || day === 21 || day === 31) {
    day += monthDays[1];
  } else if( day === 2 || day === 22) {
    day += monthDays[2];
  } else if( day === 3 || day === 23) {
    day += monthDays[3];
  } else {
  day += monthDays[4];
  }

  // Months of the year
  const months = {
    0: 'January',
    1: 'February',
    2: 'March',
    3: 'April',
    4: 'May',
    5: 'June',
    6: 'July',
    7: 'August',
    8: 'September',
    9: 'October',
    10: 'November',
    11: 'December'
  };

  return `${weekDays[date.getDay()]}, 
          ${months[date.getMonth()]} 
          ${day} 
          ${date.getFullYear()} 
         `;
}

function formatTime(date) {
  // make certain a zero is added before single digits
  const hour = date.getHours();
  const minutes = date.getMinutes();

  if(hour < 10) {
    if(minutes < 10) {
      return `0${hour}:0${minutes}`;
    } else {
      return `0${hour}:${minutes}`;
    }
  } else {
    if(minutes < 10) {
      return `${hour}:0${minutes}`;
    } else {
      return `${hour}:${minutes}`;
    }
  }
  
}

function timeDisplay() {
  if(clockIcon.className === '') {
    revealTime();
  } else {
    hideTime();
  }
}

// Function to change the color scheme of the app
function changeColors() {
  const root = document.querySelector(':root');
  let rootStyle = getComputedStyle(root);

  console.log(rootStyle.getPropertyValue('--accent-color'));

  root.style.setProperty('--accent-color', '#3d50b8');
  root.style.setProperty('--background-color', '#fff');
  root.style.setProperty('--foreground-color-hover', '#000');
  root.style.setProperty('--foreground-color', '#424242');
}

function revealTime() {
  clockIcon.className = 'rotate';
  currentTime.className = 'reveal-time';
}

function hideTime() {
  clockIcon.className = '';
  currentTime.className = 'hide-time';
}

function showTaskInput() {
  taskInputLabel.classList = 'form-label hide-task-label';

  // if user hasn't set a priority autoselect normal
  if(unfoldSelect.value === undefined) {
    showLevels();
    setTimeout(setPriorityMedium, 2000);
  }
}

function showArrow() {
  addArrow.classList = 'add-arrow show-arrow';
}

function hideArrow() {
  addArrow.classList = 'add-arrow';
}

function hideTaskInput() {
  if(taskInput.value === '') {

    taskInputLabel.classList = 'form-label show-task-label';

  } else {

    taskInputLabel.classList = 'form-label hide-task-label';

  }
}

function showLevels() {
  priorityLevelLabel.classList = 'form-label fade-out push-back';
  highPriority.classList = 'priority-option high-priority reveal-high';
  mediumPriority.classList = 'priority-option medium-priority reveal-medium';
  lowPriority.classList = 'priority-option low-priority reveal-low';
}

function hideLevels() {
  if(taskInput.value === '' && unfoldSelect.value === undefined) {
    priorityLevelLabel.classList = 'form-label fade-in';
    highPriority.classList = 'priority-option high-priority hide-high';
    mediumPriority.classList = 'priority-option medium-priority hide-medium';
    lowPriority.classList = 'priority-option low-priority hide-low';
  }
}

function setPriorityHigh() {
  highPriority.classList = 'priority-option high-priority reveal-high set-high';
  mediumPriority.classList = 'priority-option medium-priority hide-medium';
  lowPriority.classList = 'priority-option low-priority hide-low';
  priorityLevelLabel.classList = 'form-label pull-forward';
  unfoldSelect.value = 'high-p';
}

function setPriorityMedium() {
  highPriority.classList = 'priority-option high-priority hide-high';
  mediumPriority.classList = 'priority-option medium-priority reveal-medium set-medium';
  lowPriority.classList = 'priority-option low-priority hide-low';
  priorityLevelLabel.classList = 'form-label pull-forward';
  unfoldSelect.value = 'medium-p';
}

function setPriorityLow() {
  highPriority.classList = 'priority-option high-priority hide-high';
  mediumPriority.classList = 'priority-option medium-priority hide-medium';
  lowPriority.classList = 'priority-option low-priority reveal-low set-low';
  priorityLevelLabel.classList = 'form-label pull-forward';
  unfoldSelect.value = 'low-p';
}