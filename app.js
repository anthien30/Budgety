// BUDGET
let budgetController = (function () {
  // function constructor for income/expense
  let Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0)
      this.percentage = Math.round((this.value / totalIncome) * 100);
    else this.percentage = -1;
  };
  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };
  let Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  // calculate total for exp/inc
  let calculateTotal = function (type) {
    let sum = 0;
    data.allItems[type].forEach(function (current, index, array) {
      sum = sum + current.value;
    });
    data.totals[type] = sum;
  };

  // keeping track of data
  let data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, des, val) {
      let newItem, ID;

      // ID being the next one of last existing item
      if (data.allItems[type].length > 0)
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      else ID = 0;

      // create new item based on inc/exp type
      if (type === 'exp') newItem = new Expense(ID, des, val);
      else if (type === 'inc') newItem = new Income(ID, des, val);

      // add to structure
      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: function (type, id) {
      let ids, index;
      ids = data.allItems[type].map(function (current) {
        return current.id;
      });
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function () {
      //calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      // calculate budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;
      // calculate % of income spent
      if (data.totals.inc > 0)
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      else data.percentage = -1;
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (current) {
        current.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function () {
      let allPerc = data.allItems.exp.map(function (current) {
        return current.getPercentage();
      });
      return allPerc;
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    testing: function () {
      console.log(data);
    },
  };
})();

// UI
let UIController = (function () {
  // to access DOM elements more easily
  let DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month',
  };

  // format number output
  let formatNumber = function (num, type) {
    let numSplit, int, dec, sign;
    // + or - before num, exactly 2 decimal points, comma separating the thousands
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');
    int = numSplit[0];
    dec = numSplit[1];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }
    type === 'exp' ? (sign = '-') : (sign = '+');
    return `${sign} ${int}.${dec}`;
  };

  let nodeListForEach = function (list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  // to be used in controller
  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },

    getDOMstrings: function () {
      return DOMstrings;
    },

    addListItem: function (obj, type) {
      let html, newHtml, element;
      // create html string with placeholder text
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        element = DOMstrings.expenseContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      // replace placeholder text with actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
      // insert html string into DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function (selectorID) {
      let element = document.getElementById(selectorID);
      element.parentNode.removeChild(element);
    },

    clearField: function () {
      let fields, fieldsArray;
      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ', ' + DOMstrings.inputValue
      );

      fieldsArray = Array.prototype.slice.call(fields);

      fieldsArray.forEach(function (current, index, array) {
        current.value = '';
      });

      fieldsArray[0].focus();
    },

    displayBudget: function (obj) {
      let type;
      obj.budget > 0 ? (type = 'inc') : (type = 'exp');
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        'inc'
      );
      document.querySelector(DOMstrings.expensesLabel).textContent =
        formatNumber(obj.totalExp, 'exp');

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },

    displayPercentages: function (percentages) {
      let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0)
          current.textContent = percentages[index] + '%';
        else current.textContent = '---';
      });
    },

    displayMonth: function () {
      let now, year, month, months;
      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
      months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + ' ' + year;
    },

    changedType: function () {
      let fields = document.querySelectorAll(
        DOMstrings.inputType +
          ',' +
          DOMstrings.inputDescription +
          ',' +
          DOMstrings.inputValue
      );
      nodeListForEach(fields, function (current) {
        current.classList.toggle('red-focus');
      });
      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },
  };
})();

// GLOBAL APP CONTROLLER
let controller = (function (budgetCtrl, UICtrl) {
  let setupEventListeners = function () {
    // button clicked
    let DOM = UICtrl.getDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    // Enter key pressed
    document.addEventListener('keypress', function (event) {
      //console.log(event);
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener('click', ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener('change', UICtrl.changedType);
  };

  let updateBudget = function () {
    // calculate budget
    budgetCtrl.calculateBudget();
    // return budget
    let budget = budgetCtrl.getBudget();
    // display budget on UI
    UICtrl.displayBudget(budget);
  };

  let updatePercentages = function () {
    // calculate percentages
    budgetCtrl.calculatePercentages();
    // read percentages from budget controller
    let percentages = budgetCtrl.getPercentages();
    // update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  };

  let ctrlAddItem = function () {
    let input, newItem;

    // Get input data
    input = UICtrl.getInput();
    //console.log(input);

    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // Add item to budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      // Add item to UI
      UICtrl.addListItem(newItem, input.type);
      // clear fields
      UICtrl.clearField();
      // calculate and update budget
      updateBudget();
      // calculate & update percentages
      updatePercentages();
    }
  };

  let ctrlDeleteItem = function (event) {
    let itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      // parse the type and ID of item
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // delete item from data structure
      budgetCtrl.deleteItem(type, ID);
      // delete item from UI
      UICtrl.deleteListItem(itemID);
      // update and show budget
      updateBudget();
      // update percentages
      updatePercentages();
    }
  };

  return {
    // start the program
    init: function () {
      console.log('Application has started.');
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
      setupEventListeners();
    },
  };
})(budgetController, UIController);

controller.init();
