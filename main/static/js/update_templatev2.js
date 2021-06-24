myObject = new Vue({
  el: '#update_templatev2',
  data: {
    list: [],
    formats: [],
    main_image: null,
    file: null,
    editedTodo: null,
    rect: null,
    nextColumn: 0,
    columnSelected: [],
    selectedBox: null,
    names: [],
    extractedRow: null,
    extractedCol: null,
    id: null
  },
  beforeMount: function () {
    this.formats = localData;
    this.main_image = this.formats.main_image;
    this.names = this.formats.label ? this.formats.label.split('\t') : [];
    console.log(this.names)
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    this.id = urlParams.get('id');
  },
  mounted() {
    if (this.formats['img_path'] != null) {
      this.file = this.formats['img_path'];
      this.showContent2()
    }
  },
  created() {
    window.onbeforeunload = function (e) {
      return 'You sure you want to save?';
    };
  },
  methods: {
    findNextColumn() {
      return this.listColumn[this.nextColumn]
    },
    deleteImg(index) {
      this.list.splice(index, 1);
    },
    editTodo: function (todo) {
      this.list = todo;
    },
    handleFilesUpload() {
      this.file = this.$refs.files.files[0];
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        $('body').removeClass('loading');
        window.location.reload()
      };
      $('body').addClass('loading');
      var fd = new FormData();
      if (typeof this.file != "string") {
        fd.append("file", this.file);
      }
      fd.append("data", null);
      fd.append("id", this.id);
      xhr.open("POST", "/save_template", true);
      xhr.send(fd);
    },
    selectRect(x) {
      this.rect.selectObj(x);
      let line = null;
      for (let i in this.rect.labels) {
        if (this.rect.labels[i] === x) {
          line = parseInt(i);
          break
        }
      }
      let elmnt = document.getElementById('form-item-' + line);
      $('.form-head').removeClass('active');
      $(elmnt).find('.form-head').addClass('active');
    },
    generateOption(id){
      var self = this;
      input=document.getElementById('name-'+id);
      options=document.getElementById('options');
      $('#options').empty();
      for(i=0;i<self.names.length;i++) {
          options.innerHTML+='<li>'+self.names[i]+'</li>';
      }
      document.body.onclick=function(event) {
          if(event.target!=input)
            options.style.display='none';
      }
      input.onclick=function() {
          this.value='';
            options.style.display='block';
      }
      for(i=0;i<self.names.length;i++) {
        options.getElementsByTagName('li')[i].onclick = function(){
            input.value= this.textContent;
          }    
      }
    },
    // generateOption(id){
    //   var self = this;
    //   select = document.getElementById("name-"+id);
    //   $("#name-"+id).empty();
    //   for (var i = 0; i < self.names.length; i++){
    //     var opt = document.createElement('option');
    //     opt.value = self.names[i];
    //     opt.innerHTML = self.names[i];
    //     select.appendChild(opt);
    //   }
    // },
    hint(id) {
      var self = this;
      $("#name-"+id).autocomplete({
        source: self.names,
        autoFocus: true,
        select: function (event, ui) {
          console.log(ui);
          self.rect.labels[id]['label'] = ui.item.label;
        }
      });
    },
    removeAllLabels() {
      for (let x of this.rect.labels) {
        this.rect.removeLabel(x);
        this.rect.canvas.renderAll();
      }
    },
    predictLabels() {
      var self = this;
      fetch('../static/uploaded/' + this.formats['img_path'])
        .then(res => res.blob())
        .then(blob => {
            const img = new File([blob], this.formats['img_path'], {type:'image/jpeg'});
            const formData = new FormData();
            formData.append("file", img);
            console.log(formData)
            const options = {
              method: 'POST',
              body: formData,
            };
                
            fetch('http://202.191.57.61:8081/predict_labels/', options)
            .then(response => response.json())
            .then(function(data) {
              console.log('Success:', data['pills']);
              for (let id in data['pills']) {
                var pill = data['pills'][id];
                self.rect.addLabel(pill["x_min"], pill["y_min"], pill["x_max"]-pill["x_min"], pill["y_max"]-pill["y_min"], 0, pill['pillname'])
              }
              }
            )
            .catch(error => console.log('Error:', error));
            });
    },
    showContent2() {
      var wi = 650;
      var h = 650;
      if (window.screen.width < 1450) {
        wi = 450;
        h = 450;
      }

      // if (window.screen.width < 500) {
      //   wi = window.screen.width - 80;
      //   h = window.screen.height - 300 > 500 ? 400 : window.screen.height - 300;
      // }

      var canvas = new fabric.Canvas('canvas');
      var self = this;

      var img = new Image();
      img.onload = function () {

        if (window.screen.width <= 500) {
          wi = window.screen.width - 80;
          h = window.screen.height - 300 > 500 ? 400 : window.screen.height - 300; 
        }

        if (this.height > h && this.height > this.width) {
          canvas.setWidth(Math.round(h / this.height * this.width));
          canvas.setHeight(h);
        } else {
          canvas.setWidth(wi);
          canvas.setHeight(Math.round(wi / this.width * this.height));
        }

        self.rect = new Rectangle(canvas, '../static/uploaded/' + self.formats['img_path']);

        $('.canvas-container').on('mousewheel', function (options) {
          var delta = options.originalEvent.wheelDelta;
          if (delta != 0) {
            options.preventDefault();
            var pointer = canvas.getPointer(options, true);
            var point = new fabric.Point(pointer.x, pointer.y);
            if (delta > 0) {
              self.rect.zoomIn(point);
            } else if (delta < 0) {
              self.rect.zoomOut(point);
            }
          }
        });

        $('.canvas-container').on('DOMMouseScroll', function (options) {
          var delta = options.originalEvent.wheelDelta;
          if (delta != 0) {
            options.preventDefault();
            var pointer = canvas.getPointer(options, true);
            var point = new fabric.Point(pointer.x, pointer.y);
            if (delta > 0) {
              self.rect.zoomIn(point);
            } else if (delta < 0) {
              self.rect.zoomOut(point);
            }
          }
        });
        self.rect.callBack = function () {
          let rec = self.rect.canvas.getActiveObject();
          let line = null;
          for (let i in self.rect.labels) {
            if (self.rect.labels[i] === rec) {
              line = parseInt(i);
              break
            }
          }
          let elmnt = document.getElementById('form-item-' + line);
          if (elmnt != null) {
            elmnt.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });

            $('.form-head').removeClass('active');
            $(elmnt).find('.form-head').addClass('active');

          }
        };
        self.rect.drawSuccess = function () {
          if (self.formats['description'] != null) {
            var list = JSON.parse(self.formats['description']);
            for (let x of list) {
              self.rect.addLabel(x["x"], x["y"], x["w"], x["h"], x['a'], x['label']);
            }
          }
          $('.setting-content').height($(window).height() - 200);
        };

      };
      img.src = '../static/uploaded/' + this.formats['img_path'];


    },
    getMeta(url) {
      var img = new Image();
      img.onload = function () {
        alert(this.width + ' ' + this.height);
      };
      img.src = url;
    },
    reload() {
      window.location.reload();
    },
    saveTemplate() {
      var xhr = new XMLHttpRequest();
      let data = [];
      let zoom = this.rect.getScaleSized()['scale'];
      for (let lab of this.rect.labels) {
        let d = {
          'x': Math.round(lab.left / zoom),
          'y': Math.round(lab.top / zoom),
          'w': Math.round(lab.width / zoom),
          'h': Math.round(lab.height / zoom),
          'a': lab.angle,
          'label': lab.label
        };
        data.push(d);
      }
      xhr.onload = function () {
        // $('body').removeClass('loading');
        // window.location.replace('/annotation')
        window.location.replace('/set_manager?id='+this.id)
      };
      $('body').addClass('loading');
      var fd = new FormData();
      fd.append("data", JSON.stringify(data));
      fd.append("id", this.id);
      xhr.open("POST", "/save_template", true);
      xhr.send(fd);
    },
    removeLabel: function (x) {
      this.rect.removeLabel(x);
      this.rect.canvas.renderAll();
    }
  }
})
;