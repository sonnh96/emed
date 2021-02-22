myObject = new Vue({
  el: '#user_manager',
  data: {
    data: [],
    name: null,
    username: null,
    password: null,
    password_confirm: null,
    is_admin: null,
    search: null,
    filter: []
  },
  beforeMount: function () {
    this.data = localData['data'];
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
    openAdd() {
      $("#add-user").modal('toggle');
    },
    addUser() {
      if (this.name == null || this.name == '' || this.username == null || this.username == '' || this.password == null || this.password == '') {
        this.error = true;
      } else if (this.password != this.password_confirm) {
        this.error = true;
      } else {
        this.error = false;
        var formData = new FormData();
        formData.append('name', this.name);
        formData.append('username', this.username);
        formData.append('password', this.password);
        formData.append('is_admin', this.is_admin ? 1 : 0);
        $.ajax({
          url: "/add_user",
          type: "POST",
          data: formData,
          mimeTypes: "multipart/form-data",
          contentType: false,
          processData: false,
          success: function (e) {
            window.location.reload();
          }, error: function (e) {
            alert('Error');
          }
        });
      }
    },
    delUser(id) {
      var formData = new FormData();
      formData.append('id', id);
      $.ajax({
        url: "/del_user",
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