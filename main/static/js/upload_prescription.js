myObject = new Vue({
  el: '#upload',
  data: {
    list: [],
    formats: [],
    default_type: null,
    labels: [],
    files:  [],
    file: [],
    error: null,
    label: "",
    name: null,
    user_id: null,
    id: null
  },
  beforeMount: function () {},
  mounted: function () {
    this.selectFile();
    $('#add').click();
  },
  methods: {
    selectFile() {
      $('#files').click();
    },
    fileDragHover(e) {
      var fileDrag = document.getElementById('upload-content');
      e.stopPropagation();
      e.preventDefault();
      fileDrag.className = (e.type === 'dragover' ? 'hover' : 'card-body');
    },
    hint() {
      let data = {'name': this.name};
      $.ajax({
        url: "/search",
        type: "POST",
        data: JSON.stringify(data),
        contentType: 'application/json;charset=UTF-8',
        success: function (e) {
          $("#name").autocomplete({
            source: e.data.map(d => {
              return {"id": d.id, "label": d.name + (d.unit != null ? " ("+d.unit+")" : ""), "value": d.name}
            }),
            select: function (event, ui) {
              window.location.replace('/upload?id=' + ui.item.id)
            }
          });
        }, error: function () {
          // $('body').removeClass("loading");
        }
      });
    },
    deleteImg(index) {
      // if (this.list[index].status == 1) {
      // } else {
      //   this.list[index].status = 2;
      //   this.list = [...this.list]
      // }
      this.list.splice(index, 1);
    },
    fileDropHover(e) {
      var fileDrag = document.getElementById('upload-content');
      fileDrag.className = 'card-body';
      let droppedFiles = e.dataTransfer.files;
      if (!droppedFiles) return;
      var self = this;
      ([...droppedFiles]).forEach(f => {
        if (f.type.match('image.*') || f.type.match('application/pdf')) {
          self.files.push({
            'file': f,
            'url': URL.createObjectURL(f),
            'name': f.name,
          });
        }
      });
    },
    editTodo: function (todo) {
      this.list = todo;
    },
    openUpload: function () {
      $('#upload-item').modal('toggle');
    },
    handleFilesUpload() {
      let files = this.$refs.files.files;
      for(let file of files) {
        this.list.push({
          'file': file,
          'url': URL.createObjectURL(file),
          'name': file.name
        });
      }
      console.log(this.list);
    },
    clear() {
      this.list = [];
    },
    submitFiles() {
      if (this.list.length > 0) {
        var formData = new FormData();
        for (let i in this.list) {
          formData.append("img_data[]", this.list[i].file ? this.list[i].file : new File([""], "test"));
        }
        $('body').addClass("loading");
        $.ajax({
          url: "/upload_prescription",
          type: "POST",
          data: formData,
          mimeTypes: "multipart/form-data",
          contentType: false,
          processData: false,
          success: function () {
            $('body').removeClass("loading");
            alert('success');
            window.location.replace('/');
          }, error: function () {
            $('body').removeClass("loading");
          }
        });
      }
    }
  }
});