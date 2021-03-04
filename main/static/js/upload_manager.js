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
    let users = {};
    this.data.forEach(function(d) {
      if(!users[d.created_by]) {
        users[d.created_by] = 1
      } else {
        users[d.created_by] += 1
      }
    })
    this.data.forEach(function(d) {
      d['total'] = users[d.created_by]
    })
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
    delImage(id) {
      var formData = new FormData();
      formData.append('id', id);
      $.ajax({
        url: "/del_image",
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
    }
  }
});