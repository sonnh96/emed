myObject = new Vue({
  el: '#upload_manager',
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

  },
  mounted: function() {
    // $(".owl-carousel").owlCarousel({
    //   center: true,
    //   items:2,
    //   loop:false,
    //   margin:2,
    // });
  },
  methods: {

  }
});