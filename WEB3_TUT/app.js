// console.log(new Web3());
// console.log(window.ethereum);
App = {
  loading: false,
  contracts: {},

  load: async () => {
    await App.loadWeb3();
    await App.loadAccount();
    await App.loadContract();
    await App.render();
  },

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {
    // if (typeof web3 !== "undefined") {
    //   console.log("hello");
    //   App.web3Provider = web3.currentProvider;
    //   web3 = new Web3(web3.currentProvider);
    // } else {
    //   window.alert("Please connect to Metamask.");
    // }
    // Modern dapp browsers...
    if (window.ethereum) {
      console.log("Metamask Detected");
      window.web3 = new Web3(window.ethereum);
      try {
        // Request account access if needed
        var res = await ethereum.enable();
        if (res) alert("Website Connected using address: " + res);
        web3.eth.net.getNetworkType().then(console.log);
        // Acccounts now exposed
        // web3.eth.sendTransaction({
        //   /* ... */
        // });
      } catch (error) {
        alert("Permission Denied, Metamask Not connected!");
      }
    }
    // Legacy dapp browsers...
    // else if (window.web3) {
    //   App.web3Provider = web3.currentProvider;
    //   window.web3 = new Web3(web3.currentProvider);
    //   // Acccounts always exposed
    //   web3.eth.sendTransaction({
    //     /* ... */
    //   });
    // }
    // Non-dapp browsers...
    else {
      console.log(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
      alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  },

  loadAccount: async () => {
    // Set the current blockchain account
    App.account = web3.eth.accounts[0];
  },

  loadContract: async () => {
    let abi = [
      {
        constant: false,
        inputs: [
          {
            internalType: "string",
            name: "_content",
            type: "string",
          },
        ],
        name: "createTask",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "bool",
            name: "completed",
            type: "bool",
          },
        ],
        name: "TaskCompleted",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "string",
            name: "content",
            type: "string",
          },
          {
            indexed: false,
            internalType: "bool",
            name: "completed",
            type: "bool",
          },
        ],
        name: "TaskCreated",
        type: "event",
      },
      {
        constant: false,
        inputs: [
          {
            internalType: "uint256",
            name: "_id",
            type: "uint256",
          },
        ],
        name: "toggleCompleted",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: true,
        inputs: [
          {
            internalType: "uint256",
            name: "_id",
            type: "uint256",
          },
        ],
        name: "getTask",
        outputs: [
          {
            internalType: "string",
            name: "",
            type: "string",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "taskCount",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: true,
        inputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        name: "tasks",
        outputs: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "content",
            type: "string",
          },
          {
            internalType: "bool",
            name: "completed",
            type: "bool",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ];

    let address = "0x68D016885B37f295EbC896fdcAEC4455b66f1C26";
    App.todoList = new web3.eth.Contract(abi, address);
    console.log(App.todoList);
  },

  render: async () => {
    // Prevent double render
    if (App.loading) {
      return;
    }

    // Update app loading state
    App.setLoading(true);

    // Render Account
    $("#account").html(App.account);

    // Render Tasks
    await App.renderTasks();

    // Update loading state
    App.setLoading(false);
  },

  renderTasks: async () => {
    // Load the total task count from the blockchain
    const taskCount = await App.todoList.methods.taskCount().call();
    console.log(taskCount);
    const $taskTemplate = $(".taskTemplate");

    // Render out each task with a new task template
    for (var i = 1; i <= taskCount; i++) {
      // Fetch the task data from the blockchain
      const task = await App.todoList.methods.tasks(i).call();
      console.log("Task" + i, task);
      const taskId = task[0];
      const taskContent = task[1];
      const taskCompleted = task[2];

      // Create the html for the task
      const $newTaskTemplate = $taskTemplate.clone();
      console.log($newTaskTemplate);
      $newTaskTemplate.find(".content").html(taskContent);
      $newTaskTemplate
        .find("input")
        .prop("name", taskId)
        .prop("checked", taskCompleted)
        .on("click", App.toggleCompleted);

      // Put the task in the correct list
      if (taskCompleted) {
        $("#completedTaskList").append($newTaskTemplate);
      } else {
        $("#taskList").append($newTaskTemplate);
      }

      // Show the task
      $newTaskTemplate.show();
    }
  },

  createTask: async () => {
    App.setLoading(true);
    const content = $("#newTask").val();
    var rc = await App.todoList.methods
      .createTask(content)
      .send({ from: web3.currentProvider.selectedAddress });
    console.log(rc);
    //
  },

  toggleCompleted: async (e) => {
    App.setLoading(true);
    const taskId = e.target.name;
    await App.todoList.methods
      .toggleCompleted(taskId)
      .send({ from: web3.currentProvider.selectedAddress });
    window.location.reload();
  },

  setLoading: (boolean) => {
    App.loading = boolean;
    const loader = $("#loader");
    const content = $("#content");
    if (boolean) {
      loader.show();
      content.hide();
    } else {
      loader.hide();
      content.show();
    }
  },
};

$(() => {
  $(window).load(() => {
    App.load();
  });
});
