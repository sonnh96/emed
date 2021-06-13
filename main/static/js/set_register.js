myObject = new Vue({
  el: '#set_register',
  data: {
    name: null,
    users: [],
    user_select: [],
    names: [],
    main_image: null,
    pill_images: [],
    id: null
  },
  beforeMount: function () {
    if (localData != null) {
      this.name = localData.name;
      this.id = localData.id;
      this.users = localData.users
    }
  },
  mounted: function () {
    var self = this;
    var user_input = document.querySelector('#user');
    var name_input = document.querySelector('#pill_name');

    var user_tagify = new Tagify(user_input, {
      whitelist: self.users,
      maxTags: 15,
      dropdown: {
	      maxItems: 100,
        classname: "tags-look",
        enabled: 0,
        closeOnSelect: true
      }
    })
    user_tagify.on('add', function(e) {
      self.user_select.push(e.detail.data.id)
    }).on('remove', function(e) {
      const index = self.user_select.indexOf(e.detail.data.id);
      if (index > -1) {
        self.user_select.splice(index, 1);
      }
    })

    var name_tagify = new Tagify(name_input, {
      whitelist: [],
      maxTags: 15,
      dropdown: {
        maxItems: 20,
        classname: "tags-look",
        enabled: 0,
        closeOnSelect: true
      }
    })

    name_tagify.on('input', function(e) {
      let data = {'name': e.detail.value};
      name_tagify.settings.whitelist.length = 0; // reset current whitelist
      name_tagify.loading(true) // show the loader animation
      $.ajax({
        url: "/search",
        type: "POST",
        data: JSON.stringify(data),
        contentType: 'application/json;charset=UTF-8',
        success: function (res) {
          name_tagify
          name_tagify.settings.whitelist = res.data.map(d => {
            return {"id": d.id, "value": d.name + (d.pill_id != null ? " ("+d.pill_id+")" : "")}
          })
          name_tagify.loading(false).dropdown.show.call(name_tagify, e.detail.value);
        }, error: function () {
          // $('body').removeClass("loading");
        }
      })
    }).on('add', function(e) {
      self.names.push(e.detail.data.value);
    }).on('remove', function(e) {
      const index = self.names.indexOf(e.detail.data.value);
      if (index > -1) {
        self.names.splice(index, 1);
      }
    })
  },
  methods: {
    save() {
      var formData = new FormData();
      if (this.id != null) {
        formData.append("id", this.id);
      }
      formData.append("name", this.name);
      formData.append("pill_name", this.names.join('\t'));
      formData.append("users", this.user_select.join(','));
      for (let i in this.pill_images) {
        formData.append("pill_image[]", this.pill_images[i]);
      }
      formData.append("main_image", this.main_image);
      $('body').addClass("loading");
      $.ajax({
        url: "/set_register",
        type: "POST",
        data: formData,
        mimeTypes: "multipart/form-data",
        contentType: false,
        processData: false,
        success: function () {
          $('body').removeClass("loading");
          alert('success');
          window.location.replace('/set_manager');
        }, error: function () {
          $('body').removeClass("loading");
        }
      });
    },
    handleUploadMain() {
      let files = this.$refs.file_main.files;
      this.main_image  = files[0];
    },
    handleFilesUpload() {
      let files = this.$refs.pill_image.files;
      this.pill_images = [];
      for(let file of files) {
        this.pill_images.push(file);
      }
    },
    submitFiles() {
      var formData = new FormData();
      if (this.id != null) {
        formData.append("id", this.id);
      }
      formData.append("name", this.name);
      for (let i in this.pill_images) {
        formData.append("pill_image[]");
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
          alert('success');
          window.location.replace('/');
        }, error: function () {
          $('body').removeClass("loading");
        }
      });
    }
  }
});
