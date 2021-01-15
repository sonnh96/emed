myObject = new Vue({
  el: '#history',
  data: {
    data: [],
    listFilter: [],
    selectedList: [],
    formats: [],
    allSelected: false,
    pageNo: 1,
    pageSize: 10,
    pageCount: 0,
    socket: null
  },
  beforeMount: function () {
    this.data = localData.reverse();
    this.formats = localData.format;
    this.initData();
  },
  mounted() {
    var self = this;
    this.socket = io.connect('/start_processing');

    this.socket.on('connected', function (msg) {
      console.log('After connect', msg);
    });

    this.socket.on('update value', function (msg) {
      $('body').removeClass('loading');
      self.updateValue(msg['data']);
    });
  },
  methods: {
    updateValue: function (msg) {
      for (let i in this.listFilter) {
        for (let y in msg) {
          if (this.listFilter[i].id == msg[y].id) {
            this.listFilter[i].status = msg[y].status;
            this.listFilter[i].result = msg[y].result;
            break;
          }
        }
      }
    },
    initData: function () {
      var startRow = (this.pageNo - 1) * this.pageSize + 1;
      var endRow = startRow + this.pageSize - 1;
      this.pageCount = Math.ceil(this.data.length / this.pageSize);
      this.listFilter = this.queryFromVirtualDB(startRow, endRow);
    },
    queryFromVirtualDB: function (startRow, endRow) {
      var result = [];
      for (var i = startRow - 1; i < endRow; i++) {
        if (i < this.data.length) {
          result.push(this.data[i]);
        }
      }
      return result;
    },
    page: function (pageNo) {
      this.pageNo = pageNo;
      this.initData();
    },
    first: function () {
      this.pageNo = 1;
      this.initData();
    },
    last: function () {
      this.pageNo = this.pageCount;
      this.initData();
    },
    prev: function () {
      if (this.pageNo > 1) {
        this.pageNo -= 1;
        this.initData();
      }
    },
    next: function () {
      if (this.pageNo < this.pageCount) {
        this.pageNo += 1;
        this.initData();
      }
    },
    showStatus(type) {
      if (type == 0) {
        return '実行中'
      } else if (type == 1) {
        return '実行済み'
      } else if (type == 2) {
        return 'エラー'
      } else if (type == 3) {
        return '未実行'
      }
    },
    selectAll() {
      this.selectedList = [];

      if (this.allSelected) {
        for (let i in this.listFilter) {
          this.selectedList.push(this.listFilter[i].id);
        }
      }
    },
    select() {
      this.allSelected = false;
    },
    deleteResult() {
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        if (this.status == 200) {
          window.location.reload();
        }
      };
      if (this.selectedList.length > 0) {
        $('body').addClass('loading');
        var fd = new FormData();
        fd.append("data", this.selectedList);
        xhr.open("POST", "/delete_result", true);
        xhr.send(fd);
      }
    },
    saveBlob(blob, fileName) {
      var a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = fileName;
      a.dispatchEvent(new MouseEvent('click'));
    },
    exportData() {
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        $('body').removeClass('loading');
        let data = JSON.parse(this.response);
        let a = document.createElement("a");
        a.style = "display: none";
        document.body.appendChild(a);
        a.href = data.path;
        a.download = data.path.split('/').pop();
        a.click();
      };
      if (this.selectedList.length > 0) {
        $('body').addClass('loading');
        var fd = new FormData();
        fd.append("data", this.selectedList);
        xhr.open("POST", "/export", true);
        xhr.send(fd);
      }
    },
    prettyDate: function (date) {
      let pad = function (val, len) {
        val = String(val);
        len = len || 2;
        while (val.length < len) val = "0" + val;
        return val;
      };
      let a = new Date(date);
      return a.getFullYear() + "/" + pad(a.getMonth() + 1) + "/" + pad(a.getDate()) + ' ' + pad(a.getHours()) + ':' + pad(a.getMinutes()) + ':' + pad(a.getSeconds());
    },
    getType: function (id) {
      for (let x of this.data) {
        if (x.id == id) {
          return x.type
        }
      }
    },
    startProcess: function () {
      if (this.selectedList.length > 0) {
        let data = {};
        for (let x of this.selectedList) {
          data[x] = this.getType(x);
        }
        // console.log(data);
        $('body').addClass('loading');
        this.socket.emit('process', {data: data});
      }
    }
  }
});