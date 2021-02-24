myObject = new Vue({
  el: '#labels',
  data: {
    data: [],
    name: null,
    label: null,
    search: null,
    selected: null,
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
      this.selected = null;
      $("#add-label").modal('toggle');
    },
    openEdit(id, name, label) {
      this.selected = id;
      this.name = name;
      this.label = label;
      $("#add-label").modal('toggle');
    },
    openDel(id) {
      this.selected = id;
      $("#del-label").modal('toggle');
    },
    addLabel() {
      var formData = new FormData();
      formData.append('name', this.name);
      formData.append('label', this.label);
      $.ajax({
        url: "/add_label",
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
    },
    editLabel() {
      var formData = new FormData();
      formData.append('id', this.selected);
      formData.append('name', this.name);
      formData.append('label', this.label);
      $.ajax({
        url: "/update_label",
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
    },
    delLabel() {
      var formData = new FormData();
      formData.append('id', this.selected);
      $.ajax({
        url: "/del_label",
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