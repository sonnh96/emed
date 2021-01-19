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
    socket: null,
    search: null,
    filter: []
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
  mounted: function() {
    $(".owl-carousel").owlCarousel({
      center: true,
      items:2,
      loop:false,
      margin:2,
    });
  },
  methods: {
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
          $( "#tags" ).autocomplete({
            source: e.data.map(d => d.name),
            select: function( event, ui ) {
              self.search = ui.item.value
              self.reloadData()
            }
          });
        }, error: function () {
          // $('body').removeClass("loading");
        }
      });
    },
    reloadData() {
      window.location.replace('/?search='+(this.search != null ? this.search : '')+'&page='+this.pageNo);
    },
    getRange(start, end) {
      let res = [];
      for(let i = start; i <= end; i++) {
        res.push(i)
      }
      return res;
    },
    searchData() {
      this.pageNo = 1;
      window.location.replace('/?search='+(this.search != null ? this.search : ''));
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