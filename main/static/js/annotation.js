myObject = new Vue({
  el: '#annotation',
  data: {
    data: [],
    listFilter: [],
    selectedList: [],
    formats: [],
    allSelected: false,
    pageNo: 1,
    pageSize: 10,
    pageCount: 0,
    socket: null,
    search: null,
    filter: [],
    files: []
  },
  beforeMount: function () {
    this.data = localData['data'];
    this.formats = localData.format;
    this.pageCount = Math.ceil(localData['total'] / this.pageSize);
    var url = window.location.href;
    url = new URL(url);
    var p = url.searchParams.get("page");
    var s = url.searchParams.get("search");
    this.search = s;
    if (p && p != null) {
      this.pageNo = parseInt(p);
    }
  },
  mounted: function () {
    // $(".owl-carousel").owlCarousel({
    //   center: true,
    //   items:2,
    //   loop:false,
    //   margin:2,
    // });
  },
  methods: {
    selectFile() {
      $('#files').click();
    },
    handleFilesUpload() {
      let files = this.$refs.files.files;
      for (let file of files) {
        let data = {
          'file': file,
          'url': URL.createObjectURL(file),
          'name': file.name
        };
        data['label'] = "";
        data['status'] = 1;
        this.files.push(data);
      }
      var formData = new FormData();
      for (let i in this.files) {
        formData.append("img_data[]", this.files[i].file ? this.files[i].file : new File([""], "test"));
      }
      $('body').addClass("loading");
      $.ajax({
        url: "/annotation",
        type: "POST",
        data: formData,
        mimeTypes: "multipart/form-data",
        contentType: false,
        processData: false,
        success: function (e) {
          $('body').removeClass("loading");
          console.log(e);
          window.location.replace('/annotation_data?id=' + e.id);
        }, error: function () {
          $('body').removeClass("loading");
        }
      });
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
    delAnn(id) {
      var formData = new FormData();
      formData.append('id', id);
      $.ajax({
        url: "/del_template",
        type: "POST",
        data: formData,
        mimeTypes: "multipart/form-data",
        contentType: false,
        processData: false,
        success: function (e) {
          window.location.reload();
        }, error: function () {
          // $('body').removeClass("loading");
          alert('Error');
        }
      });
    },
    hint() {
      let data = {'name': this.search};
      var self = this;
      $.ajax({
        url: "/search",
        type: "POST",
        data: JSON.stringify(data),
        contentType: 'application/json;charset=UTF-8',
        success: function (e) {
          // $('body').removeClass("loading");
          $("#tags").autocomplete({
            source: e.data.map(d => d.name + (d.unit != null ? " (" + d.unit + ")" : "")),
            select: function (event, ui) {
              self.search = ui.item.value;
              self.reloadData()
            }
          });
        }, error: function () {
          // $('body').removeClass("loading");
        }
      });
    },
    reloadData() {
      window.location.replace('/annotation?search=' + (this.search != null ? this.search : '') + '&page=' + this.pageNo);
    },
    getRange(start, end) {
      if (this.pageCount < 5) {
        start = 1
      }
      let res = [];
      for (let i = start; i <= end; i++) {
        res.push(i)
      }
      return res;
    },
    searchData() {
      this.pageNo = 1;
      window.location.replace('/annotation?search=' + (this.search != null ? this.search : ''));
    },
    page(p) {
      this.pageNo = p;
      this.reloadData();
    },
    first() {
      this.pageNo = 1;
      this.reloadData();
    },
    prev() {
      if (this.pageNo > 1) {
        this.pageNo = this.pageNo - 1;
        this.reloadData();
      }
    },
    last() {
      this.pageNo = this.pageCount;
      this.reloadData();
    },
    next() {
      if (this.pageNo < this.pageCount) {
        this.pageNo = this.pageNo + 1;
        this.reloadData();
      }
    }
  }
});
