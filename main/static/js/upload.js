myObject = new Vue({
  el: '#upload',
  data: {
    list: [],
    formats: [],
    default_type: null,
    files: null,
    file: null,
    error: null,
    label: null,
    name: null,
    id: null
  },
  beforeMount: function () {
    if (localData != null) {
      this.name = localData.name;
      this.id = localData.id;
      for(let img of localData.images) {
        this.list.push({
          'id': img.id,
          'status': 3,
          'url': img.url,
          'label': img.label
        });
      }
    }
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
    deleteImg(index) {
      if (this.list[index].status == 1) {
        this.list.splice(index, 1);
      } else {
        this.list[index].status = 2;
        this.list = [...this.list]
      }
    },
    fileDropHover(e) {
      var fileDrag = document.getElementById('upload-content');
      fileDrag.className = 'card-body';
      let droppedFiles = e.dataTransfer.files;
      if (!droppedFiles) return;
      var self = this;
      ([...droppedFiles]).forEach(f => {
        if (f.type.match('image.*') || f.type.match('application/pdf')) {
          self.file = {
            'file': f,
            'url': URL.createObjectURL(f),
            'name': f.name,
          };
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
      this.file = {
        'file': files[0],
        'url': URL.createObjectURL(files[0]),
        'name': files[0].name
      };
    },
    clear() {
      this.list = [];
    },
    addItem() {
      if (this.file != null) {
        this.file['label'] = this.label;
        this.file['status'] = 1;
        this.list.push(this.file);
        this.file = null;
        this.label = null;
        $('#upload-item').modal('toggle');
      }
    },
    submitFiles() {
      if (this.name == null && this.name == '') {
        this.error  = true;
        return
      } else {
        this.error = false;
      }
      if (this.list.length > 0) {
        var formData = new FormData();
        if (this.id != null) {
          formData.append("id", this.id);
        }
        formData.append("pill_name", this.name);
        for (let i in this.list) {
          formData.append("img_data[]", this.list[i].file ? this.list[i].file : new File([""], "test"));
          formData.append("label_" + i, this.list[i].label);
          formData.append("status_" + i, this.list[i].status);
          formData.append("id_" + i, this.list[i].id);
        }
        $('body').addClass("loading");
        $.ajax({
          url: "/upload",
          type: "POST",
          data: formData,
          mimeTypes: "multipart/form-data",
          contentType: false,
          processData: false,
          success: function () {
            $('body').removeClass("loading");
            alert('success')
          }, error: function () {
            $('body').removeClass("loading");
          }
        });
      }
    }
  }
});