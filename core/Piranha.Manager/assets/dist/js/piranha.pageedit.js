Vue.component("region", {
    props: ["model"],
    methods: {
        moveItem: function (from, to) {
            this.model.items.splice(to, 0, this.model.items.splice(from, 1)[0])
        },
        addItem: function () {
            var self = this;

            fetch(piranha.baseUrl + "manager/api/content/page/region/" + piranha.pageedit.typeId + "/" + this.model.meta.name)
                .then(function (response) { return response.json(); })
                .then(function (result) {
                    self.model.items.push(result);
                })
                .catch(function (error) { console.log("error:", error );
            });
        },
        removeItem: function (item) {
            this.model.items.splice(this.model.items.indexOf(item), 1);
        },
        updateTitle: function (e) {
            for (var n = 0; n < this.model.items.length; n++) {
                if (this.model.items[n].uid === e.uid) {
                    this.model.items[n].title = e.title;
                    break;
                }
            }
        },
    },
    mounted: function () {
        if (this.model.meta.isCollection)
        {
            var self = this;

            sortable("#" + this.model.meta.uid, {
                handle: '.card-header a:first-child',
                items: ":not(.unsortable)"
            })[0].addEventListener("sortupdate", function (e) {
                self.moveItem(e.detail.origin.index, e.detail.destination.index);
            });
        }
    },
    template:
        "<div class='row' v-if='!model.meta.isCollection'>" +
        "  <div class='col-sm-12' v-if='model.meta.description != null'>" +
        "    <div class='alert alert-info' v-html='model.meta.description'></div>" +
        "  </div>" +
        "  <div class='form-group' :class='{ \"col-sm-6\": field.meta.isHalfWidth, \"col-sm-12\": !field.meta.isHalfWidth }' v-for='field in model.items[0].fields'>" +
        "    <label>{{ field.meta.name }}</label>" +
        "    <div v-if='field.meta.description != null' v-html='field.meta.description' class='field-description small text-muted'></div>" +
        "    <component v-if='field.model != null' v-bind:is='field.meta.component' v-bind:uid='field.meta.uid' v-bind:meta='field.meta' v-bind:model='field.model'></component>" +
        "  </div>" +
        "</div>" +
        "<div v-else>" +
        "  <div v-if='model.meta.description != null'>" +
        "    <div class='alert alert-info' v-html='model.meta.description'></div>" +
        "  </div>" +
        "  <div :id='model.meta.uid' class='accordion sortable' :class='model.items.length !== 0 ? \"mb-3\" : \"\"'>" +
        "    <div class='card' :key='item.uid' v-for='(item, index) in model.items'>" +
        "      <div class='card-header'>" +
        "        <a href='#' data-toggle='collapse' :data-target='\"#body\" + item.uid'>" +
        "          <div class='handle'>" +
        "            <i class='fas fa-ellipsis-v'></i>" +
        "          </div>" +
        "          {{ item.title }}" +
        "        </a>" +
        "        <span class='actions float-right'>" +
        "          <a v-on:click.prevent='removeItem(item)' href='#' class='danger'><i class='fas fa-trash'></i></a>" +
        "        </span>" +
        "      </div>" +
        "      <div :id='\"body\" + item.uid' class='collapse' :data-parent='\"#\" + model.meta.uid'>" +
        "        <div class='card-body'>" +
        "          <div class='row'>" +
        "            <div class='form-group' :class='{ \"col-sm-6\": field.meta.isHalfWidth, \"col-sm-12\": !field.meta.isHalfWidth }' v-for='field in item.fields'>" +
        "              <label>{{ field.meta.name }}</label>" +
        "              <component v-if='field.model != null' v-bind:is='field.meta.component' v-bind:uid='item.uid' v-bind:meta='field.meta' v-bind:model='field.model' v-on:update-field='updateTitle($event)'></component>" +
        "            </div>" +
        "          </div>" +
        "        </div>" +
        "      </div>" +
        "    </div>" +
        "  </div>" +
        "  <a href='#' class='block-add' v-on:click.prevent='addItem()'>" +
        "    <hr>" +
        "    <i class='fas fa-plus-circle'></i>" +
        "  </a>" +
        "  <div v-if='model.items.length === 0' class='empty-info unsortable'>" +
        "    <p>{{ piranha.resources.texts.emptyAddAbove }}</p>" +
        "  </div>" +
        "</div>"
});

Vue.component("post-archive", {
    props: ["uid", "id"],
    data: function() {
        return {
            items: [],
            categories: [],
            postTypes: [],
            status: "all",
            category: "All categories"
        }
    },
    methods: {
        load: function () {
            var self = this;

            fetch(piranha.baseUrl + "manager/api/post/list/" + self.id)
                .then(function (response) { return response.json(); })
                .then(function (result) {
                    self.items = result.posts;
                    self.categories = result.categories;
                    self.postTypes = result.postTypes;
                })
                .catch(function (error) { console.log("error:", error ); });
        },
        remove: function (postId) {
            var self = this;

            fetch(piranha.baseUrl + "manager/api/post/delete/" + postId)
                .then(function (response) { return response.json(); })
                .then(function (result) {
                    piranha.notifications.push(result);

                    self.load();
                })
                .catch(function (error) { console.log("error:", error ); });
        },
        isSelected: function (item) {
            // Check category
            if (this.category !== "All categories" && item.category !== this.category) {
                return false;
            }

            // Check status
            if (this.status === "draft") {
                return item.status === "draft" || item.status === "unpublished";
            } else if (this.status === 'scheduled') {
                return item.isScheduled;
            }

            // Selected
            return true;
        },
        selectStatus: function (status) {
            this.status = status;
        },
        selectCategory: function (category) {
            this.category = category;
        }
    },
    mounted: function () {
        this.load();
    },
    beforeDestroy: function () {
    },
    template:
        "<div :id='uid'>" +
        "  <div class='mb-2'>" +
        "    <div class='btn-group' role='group'>" +
        "      <button v-on:click='selectStatus(\"all\")' class='btn btn-sm' :class='status === \"all\" ? \"btn-primary\" : \"btn-light\"' href='#'>All</button>" +
        "      <button v-on:click='selectStatus(\"draft\")' class='btn btn-sm' :class='status === \"draft\" ? \"btn-primary\" : \"btn-light\"' href='#'>Drafts</button>" +
        "      <button v-on:click='selectStatus(\"scheduled\")' class='btn btn-sm' :class='status === \"scheduled\" ? \"btn-primary\" : \"btn-light\"' href='#'>Scheduled</button>" +
        "    </div>" +
        "    <div v-if='postTypes.length > 1' class='btn-group' role='group'>" +
        "      <button type='button' class='btn btn-sm btn-light dropdown-toggle' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>" +
        "        All types" +
        "      </button>" +
        "      <div class='dropdown-menu dropdown-menu-right'>" +
        "        <a v-for='type in postTypes' href='#' class='dropdown-item'>{{ type.title }}</a>" +
        "      </div>" +
        "    </div>" +
        "    <div v-if='categories.length > 1' class='btn-group' role='group'>" +
        "      <button type='button' class='btn btn-sm dropdown-toggle' :class='category === \"All categories\" ? \"btn-light\" : \"btn-primary\"' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>" +
        "        {{ category }}" +
        "      </button>" +
        "      <div class='dropdown-menu dropdown-menu-right'>" +
        "        <a v-on:click.prevent='selectCategory(\"All categories\")' href='#' class='dropdown-item'>All categories</a>" +
        "        <a v-on:click.prevent='selectCategory(category.title)' v-for='category in categories' href='#' class='dropdown-item'>{{ category.title }}</a>" +
        "      </div>" +
        "    </div>" +
        "    <button class='btn btn-sm btn-primary btn-labeled float-right'><i class='fas fa-plus'></i>Add item</button>" +
        "  </div>" +
        "  <table class='table'>" +
        "    <tbody>" +
        "      <tr v-if='isSelected(post)' v-for='post in items' :class='post.status'>" +
        "        <td>" +
        "          <a href='#'>{{ post.title }}</a> " +
        "          <small v-if='post.status === \"published\"' class='text-muted'>| Published: {{ post.published }}</small>" +
        "          <small v-else-if='post.status === \"unpublished\"' class='text-muted'>| Unpublished</small>" +
        "        </td>" +
        "        <td>" +
        "          {{ post.typeName }}" +
        "        </td>" +
        "        <td>" +
        "          {{ post.category }}" +
        "        </td>" +
        "        <td class='actions one'>" +
        "          <a href='remove(post.id)' class='danger'><i class='fas fa-trash'></i></a>" +
        "        </td>" +
        "      </tr>" +
        "    </tbody>" +
        "  </table>" +
        "</div>"
});

Vue.component("block-group", {
    props: ["uid", "model"],
    methods: {
        selectItem: function (item) {
            for (var n = 0; n < this.model.items.length; n++) {
                if (this.model.items[n] == item) {
                    this.model.items[n].isActive = true;
                } else {
                    this.model.items[n].isActive = false;
                }
            }
        },
        removeItem: function (item) {
            var itemActive = item.isActive;
            var itemIndex = this.model.items.indexOf(item);

            this.model.items.splice(itemIndex, 1);

            if (itemActive) {
                this.selectItem(this.model.items[Math.min(itemIndex, this.model.items.length - 1)]);
            }
        },
        addGroupBlock: function (type, pos) {
            var self = this;

            fetch(piranha.baseUrl + "manager/api/content/block/" + type)
                .then(function (response) { return response.json(); })
                .then(function (result) {
                    self.model.items.push(result.body);
                    self.selectItem(result.body);
                })
                .catch(function (error) { console.log("error:", error );
            });
        },
        updateTitle: function (e) {
            for (var n = 0; n < this.model.items.length; n++) {
                if (this.model.items[n].meta.uid === e.uid) {
                    this.model.items[n].meta.title = e.title;
                    break;
                }
            }
        },
        moveItem: function (from, to) {
            this.model.items.splice(to, 0, this.model.items.splice(from, 1)[0])
        }
    },
    mounted: function () {
        var self = this;

        sortable("#" + this.uid + " .list-group", {
            items: ":not(.unsortable)"
        })[0].addEventListener("sortupdate", function (e) {
            self.moveItem(e.detail.origin.index, e.detail.destination.index);
        });
    },
    beforeDestroy: function () {
    },
    template:
        "<div :id='uid' class='block-group'>" +
        "  <div class='block-group-header'>" +
        "    <div class='form-group' v-for='field in model.fields'>" +
        "      <label>{{ field.meta.name }}</label>" +
        "      <component v-bind:is='field.meta.component' v-bind:uid='field.meta.uid' v-bind:meta='field.meta' v-bind:model='field.model'></component>" +
        "    </div>" +
        "  </div>" +
        "  <div class='row'>" +
        "    <div class='col-md-4'>" +
        "      <div class='list-group list-group-flush'>" +
        "        <div class='list-group-item' :class='{ active: child.isActive }' v-for='child in model.items' v-bind:key='child.meta.uid'>" +
        "          <a href='#' v-on:click.prevent='selectItem(child)'>" +
        "            <div class='handle'>" +
        "              <i class='fas fa-ellipsis-v'></i>" +
        "            </div>" +
        "            {{ child.meta.title }}" +
        "          </a>" +
        "          <span class='actions'>" +
        "            <a v-on:click.prevent='removeItem(child)' href='#' class='danger'><i class='fas fa-trash'></i></a>" +
        "          </span>" +
        "        </div>" +
        "      </div>" +
        "      <button v-on:click.prevent='piranha.blockpicker.open(addGroupBlock, 0, model.type)' class='btn btn-sm btn-primary btn-labeled mt-3'><i class='fas fa-plus'></i>{{ piranha.resources.texts.add }}</button>" +
        "    </div>" +
        "    <div class='col-md-8'>" +
        "      <div v-if='model.items.length === 0' class='empty-info unsortable'>" +
        "        <p>{{ piranha.resources.texts.emptyAddLeft }}</p>" +
        "      </div>" +
        "      <div v-for='child in model.items' v-if='child.isActive' :class='\"block \" + child.meta.component'>" +
        "        <component v-bind:is='child.meta.component' v-bind:uid='child.meta.uid' v-bind:model='child.model' v-on:update-title='updateTitle($event)'></component>" +
        "      </div>" +
        "    </div>" +
        "  </div>" +
        "</div>"
});

Vue.component("block-group-horizontal", {
    props: ["uid", "model"],
    methods: {
        removeItem: function (item) {
            var itemIndex = this.model.items.indexOf(item);

            this.model.items.splice(itemIndex, 1);
        },
        addGroupBlock: function (type, pos) {
            var self = this;

            fetch(piranha.baseUrl + "manager/api/content/block/" + type)
                .then(function (response) { return response.json(); })
                .then(function (result) {
                    sortable("#" + self.uid + " .block-group-items", "destroy");

                    self.model.items.push(result.body);

                    Vue.nextTick(function () {
                        sortable("#" + self.uid + " .block-group-items", {
                            handle: '.handle',
                            items: ":not(.unsortable)",
                            placeholderClass: "col sortable-placeholder"
                        })[0].addEventListener("sortupdate", function (e) {
                            self.moveItem(e.detail.origin.index, e.detail.destination.index);
                        });
                    });
                })
                .catch(function (error) { console.log("error:", error );
            });
        },
        moveItem: function (from, to) {
            this.model.items.splice(to, 0, this.model.items.splice(from, 1)[0])
        }
    },
    mounted: function () {
        var self = this;

        sortable("#" + this.uid + " .block-group-items", {
            handle: '.handle',
            items: ":not(.unsortable)",
            placeholderClass: "col sortable-placeholder"
        })[0].addEventListener("sortupdate", function (e) {
            self.moveItem(e.detail.origin.index, e.detail.destination.index);
        });
    },
    beforeDestroy: function () {
    },
    template:
        "<div :id='uid' class='block-group'>" +
        "  <div class='actions block-group-actions'>" +
        "    <button v-on:click.prevent='piranha.blockpicker.open(addGroupBlock, 0, model.type)' class='btn btn-sm add'>" +
        "      <i class='fas fa-plus'></i>" +
        "    </button>" +
        "  </div>" +
        "  <div class='block-group-header'>" +
        "    <div class='form-group' v-for='field in model.fields'>" +
        "      <label>{{ field.meta.name }}</label>" +
        "      <component v-bind:is='field.meta.component' v-bind:uid='field.meta.uid' v-bind:meta='field.meta' v-bind:model='field.model'></component>" +
        "    </div>" +
        "  </div>" +
        "  <div class='row block-group-items'>" +
        "    <div v-if='model.items.length === 0' class='col'>" +
        "      <div class='empty-info unsortable'>" +
        "        <p>{{ piranha.resources.texts.emptyAddAbove }}</p>" +
        "      </div>" +
        "    </div>" +
        "    <div v-for='child in model.items' v-bind:key='child.meta.uid' class='col'>" +
        "      <div :class='\"block \" + child.meta.component'>" +
        "        <div class='block-header'>" +
        "          <div class='title'>" +
        "            <i :class='child.meta.icon'></i><strong>{{ child.meta.name }}</strong>" +
        "          </div>" +
        "          <div class='actions'>" +
        "            <span class='btn btn-sm handle'>" +
        "              <i class='fas fa-ellipsis-v'></i>" +
        "            </span>" +
        "            <button v-on:click.prevent='removeItem(child)' class='btn btn-sm danger' tabindex='-1'>" +
        "              <i class='fas fa-trash'></i>" +
        "            </button>" +
        "          </div>" +
        "        </div>" +
        "        <component v-bind:is='child.meta.component' v-bind:uid='child.meta.uid' v-bind:model='child.model'></component>" +
        "      </div>" +
        "    </div>" +
        "  </div>" +
        "</div>"
});

/*global
    piranha
*/

Vue.component("html-block", {
    props: ["uid", "model"],
    data: function () {
        return {
            body: this.model.body.value
        };
    },
    methods: {
        onBlur: function (e) {
            this.model.body.value = e.target.innerHTML;
        }
    },
    computed: {
        isEmpty: function () {
            return piranha.utils.isEmptyHtml(this.model.body.value);
        }
    },
    mounted: function () {
        piranha.editor.addInline(this.uid);
    },
    beforeDestroy: function () {
        piranha.editor.remove(this.uid);
    },
    template:
        "<div class='block-body' :class='{ empty: isEmpty }'>" +
        "  <div contenteditable='true' :id='uid' spellcheck='false' v-html='body' v-on:blur='onBlur'></div>" +
        "</div>"
});

/*global
    piranha
*/

Vue.component("html-column-block", {
    props: ["uid", "model"],
    data: function () {
        return {
            column1: this.model.column1.value,
            column2: this.model.column2.value,
        };
    },
    methods: {
        onBlurCol1: function (e) {
            this.model.column1.value = e.target.innerHTML;
        },
        onBlurCol2: function (e) {
            this.model.column2.value = e.target.innerHTML;
        }
    },
    computed: {
        isEmpty1: function () {
            return piranha.utils.isEmptyHtml(this.model.column1.value);
        },
        isEmpty2: function () {
            return piranha.utils.isEmptyHtml(this.model.column2.value);
        }
    },
    mounted: function () {
        piranha.editor.addInline(this.uid + 1);
        piranha.editor.addInline(this.uid + 2);
    },
    beforeDestroy: function () {
        piranha.editor.remove(this.uid + 1);
        piranha.editor.remove(this.uid + 2);
    },
    template:
        "<div class='block-body' class='row'>" +
        "  <div class='col-md-6'>" +
        "    <div :class='{ empty: isEmpty1 }'>" +
        "      <div :id='uid + 1' contenteditable='true' spellcheck='false' v-html='column1' v-on:blur='onBlurCol1'></div>" +
        "    </div>" +
        "  </div>" +
        "  <div class='col-md-6'>" +
        "    <div :class='{ empty: isEmpty2 }'>" +
        "      <div :id='uid + 2' contenteditable='true' spellcheck='false' v-html='column2' v-on:blur='onBlurCol2'></div>" +
        "    </div>" +
        "  </div>" +
        "</div>"
});

/*global
    piranha
*/

Vue.component("image-block", {
    props: ["uid", "model"],
    methods: {
        clear: function () {
            // clear media from block
        },
        select: function () {
            if (this.model.body.media != null) {
                piranha.mediapicker.open(this.update, "Image", this.model.body.media.folderId);
            } else {
                piranha.mediapicker.openCurrentFolder(this.update, "Image");
            }
        },
        remove: function () {
            this.model.body.id = null;
            this.model.body.media = null;
        },
        update: function (media) {
            if (media.type === "Image") {
                this.model.body.id = media.id;
                this.model.body.media = media;

                // Tell parent that title has been updated
                this.$emit('update-title', {
                    uid: this.uid,
                    title: this.model.body.media.filename
                });
            } else {
                console.log("No image was selected");
            }
        }
    },
    computed: {
        isEmpty: function () {
            return this.model.body.media == null;
        },
        mediaUrl: function () {
            if (this.model.body.media != null) {
                return piranha.utils.formatUrl(this.model.body.media.publicUrl);
            } else {
                return piranha.utils.formatUrl("~/manager/assets/img/empty-image.png");
            }
        }
    },
    mounted: function() {
        this.model.getTitle = function () {
            if (this.model.media != null) {
                return this.model.media.filename;
            } else {
                return "No image selected";
            }
        };
    },
    template:
        "<div class='block-body has-media-picker' :class='{ empty: isEmpty }'>" +
        "  <img :src='mediaUrl'>" +
        "  <div class='media-picker'>" +
        "    <div class='btn-group float-right'>" +
        "      <button v-on:click.prevent='select' class='btn btn-primary text-center'>" +
        "        <i class='fas fa-plus'></i>" +
        "      </button>" +
        "      <button v-on:click.prevent='remove' class='btn btn-danger text-center'>" +
        "        <i class='fas fa-times'></i>" +
        "      </button>" +
        "    </div>" +
        "    <div class='card text-left'>" +
        "      <div class='card-body' v-if='isEmpty'>" +
        "        &nbsp;" +
        "      </div>" +
        "      <div class='card-body' v-else>" +
        "        {{ model.body.media.filename }}" +
        "      </div>" +
        "    </div>" +
        "  </div>" +
        "</div>"
});

/*global
    piranha
*/

Vue.component("quote-block", {
    props: ["model"],
    methods: {
        onBlur: function (e) {
            this.model.body.value = e.target.innerText;
        }
    },
    computed: {
        isEmpty: function () {
            return piranha.utils.isEmptyText(this.model.body.value);
        }
    },
    template:
        "<div class='block-body' :class='{ empty: isEmpty }'>" +
        "  <i class='fas fa-quote-right quote'></i>" +
        "  <p class='lead' contenteditable='true' spellcheck='false' v-model='model.body.value' v-on:blur='onBlur'></pre>" +
        "</div>"
});

/*global
    piranha
*/

Vue.component("separator-block", {
    props: ["model"],
    template:
        "<div class='block-body'>" +
        "  <hr>" +
        "</div>"
});

/*global
    piranha
*/

Vue.component("text-block", {
    props: ["model"],
    methods: {
        onBlur: function (e) {
            this.model.body.value = e.target.innerHTML;
        }
    },
    computed: {
        isEmpty: function () {
            return piranha.utils.isEmptyText(this.model.body.value);
        }
    },
    template:
        "<div class='block-body' :class='{ empty: isEmpty }'>" +
        "  <pre contenteditable='true' spellcheck='false' v-html='model.body.value' v-on:blur='onBlur'></pre>" +
        "</div>"
});

Vue.component("missing-block", {
    props: ["model"],
    template:
        "<div class='alert alert-danger text-center' role='alert'>No component registered for <code>{{ model.type }}</code></div>"
});

/*global
    piranha
*/

Vue.component("audio-block", {
    props: ["uid", "model"],
    methods: {
        clear: function () {
            // clear media from block
        },
        select: function () {
            if (this.model.body.media != null) {
                piranha.mediapicker.open(this.update, "Audio", this.model.body.media.folderId);
            } else {
                piranha.mediapicker.openCurrentFolder(this.update, "Audio");
            }
        },
        remove: function () {
            this.model.body.id = null;
            this.model.body.media = null;
        },
        update: function (media) {
            if (media.type === "Audio") {
                this.model.body.id = media.id;
                this.model.body.media = media;

                // Tell parent that title has been updated
                this.$emit('update-title', {
                    uid: this.uid,
                    title: this.model.body.media.filename
                });
            } else {
                console.log("No video was selected");
            }
        }
    },
    computed: {
        isEmpty: function () {
            return this.model.body.media == null;
        },
        mediaUrl: function () {
            if (this.model.body.media != null) {
                return piranha.utils.formatUrl(this.model.body.media.publicUrl);
            }
        }
    },
    mounted: function() {
        this.model.getTitle = function () {
            if (this.model.media != null) {
                return this.model.media.filename;
            } else {
                return "No audio selected";
            }
        };
    },
    template:
        "<div class='block-body has-media-picker d-flex align-items-center' :class='{ empty: isEmpty }'>" +
        "  <audio class='flex-grow-1' :src='mediaUrl' controls></audio>" +
        "  <div class='media-picker slide-in'>" +
        "    <div class='btn-group float-right'>" +
        "      <button v-on:click.prevent='select' class='btn btn-primary text-center'>" +
        "        <i class='fas fa-plus'></i>" +
        "      </button>" +
        "      <button v-on:click.prevent='remove' class='btn btn-danger text-center'>" +
        "        <i class='fas fa-times'></i>" +
        "      </button>" +
        "    </div>" +
        "    <div class='card text-left'>" +
        "      <div class='card-body' v-if='isEmpty'>" +
        "        &nbsp;" +
        "      </div>" +
        "      <div class='card-body' v-else>" +
        "        {{ model.body.media.filename }}" +
        "      </div>" +
        "    </div>" +
        "  </div>" +
        "</div>"
});

/*global
    piranha
*/

Vue.component("video-block", {
    props: ["uid", "model"],
    methods: {
        clear: function () {
            // clear media from block
        },
        select: function () {
            if (this.model.body.media != null) {
                piranha.mediapicker.open(this.update, "Video", this.model.body.media.folderId);
            } else {
                piranha.mediapicker.openCurrentFolder(this.update, "Video");
            }
        },
        remove: function () {
            this.model.body.id = null;
            this.model.body.media = null;
        },
        update: function (media) {
            if (media.type === "Video") {
                this.model.body.id = media.id;
                this.model.body.media = media;

                // Tell parent that title has been updated
                this.$emit('update-title', {
                    uid: this.uid,
                    title: this.model.body.media.filename
                });
            } else {
                console.log("No video was selected");
            }
        }
    },
    computed: {
        isEmpty: function () {
            return this.model.body.media == null;
        },
        mediaUrl: function () {
            if (this.model.body.media != null) {
                return piranha.utils.formatUrl(this.model.body.media.publicUrl);
            }
        }
    },
    mounted: function() {
        this.model.getTitle = function () {
            if (this.model.media != null) {
                return this.model.media.filename;
            } else {
                return "No video selected";
            }
        };
    },
    template:
        "<div class='block-body has-media-picker' :class='{ empty: isEmpty }'>" +
        "  <video class='w-100 mx-100' :src='mediaUrl' controls></video>" +
        "  <div class='media-picker'>" +
        "    <div class='btn-group float-right'>" +
        "      <button v-on:click.prevent='select' class='btn btn-primary text-center'>" +
        "        <i class='fas fa-plus'></i>" +
        "      </button>" +
        "      <button v-on:click.prevent='remove' class='btn btn-danger text-center'>" +
        "        <i class='fas fa-times'></i>" +
        "      </button>" +
        "    </div>" +
        "    <div class='card text-left'>" +
        "      <div class='card-body' v-if='isEmpty'>" +
        "        &nbsp;" +
        "      </div>" +
        "      <div class='card-body' v-else>" +
        "        {{ model.body.media.filename }}" +
        "      </div>" +
        "    </div>" +
        "  </div>" +
        "</div>"
});

Vue.component("checkbox-field", {
    props: ["uid", "model", "meta"],
    template:
        "<div class='form-group form-check'>" +
        "  <input type='checkbox' class='form-check-input' :id='meta.uid' v-model='model.value'>" +
        "  <label class='form-check-label' :for='meta.uid'>{{ meta.placeholder}}</label>" +
        "</div>"
});

Vue.component("date-field", {
    props: ["uid", "model", "meta"],
    template:
        "<input class='form-control' type='text' :placeholder='meta.placeholder' v-model='model.value'>"
});

/*global
    piranha
*/

Vue.component("document-field", {
    props: ["uid", "model", "meta"],
    methods: {
        clear: function () {
            // clear media from block
        },
        select: function () {
            if (this.model.media != null) {
                piranha.mediapicker.open(this.update, "Document", this.model.media.folderId);
            } else {
                piranha.mediapicker.openCurrentFolder(this.update, "Document");
            }
        },
        remove: function () {
            this.model.id = null;
            this.model.media = null;
        },
        update: function (media) {
            if (media.type === "Document") {
                this.model.id = media.id;
                this.model.media = media;

                // Tell parent that title has been updated
                this.$emit('update-title', {
                    uid: this.uid,
                    title: this.model.media.filename
                });
            } else {
                console.log("No document was selected");
            }
        }
    },
    computed: {
        isEmpty: function () {
            return this.model.media == null;
        }
    },
    mounted: function() {
        this.model.getTitle = function () {
            if (this.model.media != null) {
                return this.model.media.filename;
            } else {
                return "No document selected";
            }
        };
    },
    template:
        "<div class='media-field' :class='{ empty: isEmpty }'>" +
        "  <div class='media-picker'>" +
        "    <div class='btn-group float-right'>" +
        "      <button v-on:click.prevent='select' class='btn btn-primary text-center'>" +
        "        <i class='fas fa-plus'></i>" +
        "      </button>" +
        "      <button v-on:click.prevent='remove' class='btn btn-danger text-center'>" +
        "        <i class='fas fa-times'></i>" +
        "      </button>" +
        "    </div>" +
        "    <div class='card text-left'>" +
        "      <div class='card-body' v-if='isEmpty'>" +
        "        <span v-if='meta.placeholder != null' class='text-secondary'>{{ meta.placeholder }}</span>" +
        "        <span v-if='meta.placeholder == null' class='text-secondary'>&nbsp;</span>" +
        "      </div>" +
        "      <div class='card-body' v-else>" +
        "        <a href='#' v-on:click.prevent='piranha.preview.open(model.id)'>{{ model.media.filename }}</a>" +
        "      </div>" +
        "    </div>" +
        "  </div>" +
        "</div>"
});

/*global
    piranha
*/

Vue.component("video-field", {
    props: ["uid", "model", "meta"],
    methods: {
        clear: function () {
            // clear media from block
        },
        select: function () {
            if (this.model.media != null) {
                piranha.mediapicker.open(this.update, "Video", this.model.media.folderId);
            } else {
                piranha.mediapicker.openCurrentFolder(this.update, "Video");
            }
        },
        remove: function () {
            this.model.id = null;
            this.model.media = null;
        },
        update: function (media) {
            if (media.type === "Video") {
                this.model.id = media.id;
                this.model.media = media;

                // Tell parent that title has been updated
                this.$emit('update-title', {
                    uid: this.uid,
                    title: this.model.media.filename
                });
            } else {
                console.log("No video was selected");
            }
        }
    },
    computed: {
        isEmpty: function () {
            return this.model.media == null;
        }
    },
    mounted: function() {
        this.model.getTitle = function () {
            if (this.model.media != null) {
                return this.model.media.filename;
            } else {
                return "No video selected";
            }
        };
    },
    template:
        "<div class='media-field' :class='{ empty: isEmpty }'>" +
        "  <div class='media-picker'>" +
        "    <div class='btn-group float-right'>" +
        "      <button v-on:click.prevent='select' class='btn btn-primary text-center'>" +
        "        <i class='fas fa-plus'></i>" +
        "      </button>" +
        "      <button v-on:click.prevent='remove' class='btn btn-danger text-center'>" +
        "        <i class='fas fa-times'></i>" +
        "      </button>" +
        "    </div>" +
        "    <div class='card text-left'>" +
        "      <div class='card-body' v-if='isEmpty'>" +
        "        <span v-if='meta.placeholder != null' class='text-secondary'>{{ meta.placeholder }}</span>" +
        "        <span v-if='meta.placeholder == null' class='text-secondary'>&nbsp;</span>" +
        "      </div>" +
        "      <div class='card-body' v-else>" +
        "        <a href='#' v-on:click.prevent='piranha.preview.open(model.id)'>{{ model.media.filename }}</a>" +
        "      </div>" +
        "    </div>" +
        "  </div>" +
        "</div>"
});

/*global
    piranha
*/

Vue.component("audio-field", {
    props: ["uid", "model", "meta"],
    methods: {
        clear: function () {
            // clear media from block
        },
        select: function () {
            if (this.model.media != null) {
                piranha.mediapicker.open(this.update, "Audio", this.model.media.folderId);
            } else {
                piranha.mediapicker.openCurrentFolder(this.update, "Audio");
            }
        },
        remove: function () {
            this.model.id = null;
            this.model.media = null;
        },
        update: function (media) {
            if (media.type === "Audio") {
                this.model.id = media.id;
                this.model.media = media;

                // Tell parent that title has been updated
                this.$emit('update-title', {
                    uid: this.uid,
                    title: this.model.media.filename
                });
            } else {
                console.log("No audio was selected");
            }
        }
    },
    computed: {
        isEmpty: function () {
            return this.model.media == null;
        }
    },
    mounted: function() {
        this.model.getTitle = function () {
            if (this.model.media != null) {
                return this.model.media.filename;
            } else {
                return "No audio selected";
            }
        };
    },
    template:
        "<div class='media-field' :class='{ empty: isEmpty }'>" +
        "  <div class='media-picker'>" +
        "    <div class='btn-group float-right'>" +
        "      <button v-on:click.prevent='select' class='btn btn-primary text-center'>" +
        "        <i class='fas fa-plus'></i>" +
        "      </button>" +
        "      <button v-on:click.prevent='remove' class='btn btn-danger text-center'>" +
        "        <i class='fas fa-times'></i>" +
        "      </button>" +
        "    </div>" +
        "    <div class='card text-left'>" +
        "      <div class='card-body' v-if='isEmpty'>" +
        "        <span v-if='meta.placeholder != null' class='text-secondary'>{{ meta.placeholder }}</span>" +
        "        <span v-if='meta.placeholder == null' class='text-secondary'>&nbsp;</span>" +
        "      </div>" +
        "      <div class='card-body' v-else>" +
        "        <a href='#' v-on:click.prevent='piranha.preview.open(model.id)'>{{ model.media.filename }}</a>" +
        "      </div>" +
        "    </div>" +
        "  </div>" +
        "</div>"
});

/*global
    piranha
*/

Vue.component("media-field", {
    props: ["uid", "model", "meta"],
    methods: {
        clear: function () {
            // clear media from block
        },
        select: function () {
            if (this.model.media != null) {
                piranha.mediapicker.open(this.update, null, this.model.media.folderId);
            } else {
                piranha.mediapicker.openCurrentFolder(this.update, null);
            }
        },
        remove: function () {
            this.model.id = null;
            this.model.media = null;
        },
        update: function (media) {
            this.model.id = media.id;
            this.model.media = media;

            // Tell parent that title has been updated
            this.$emit('update-title', {
                uid: this.uid,
                title: this.model.media.filename
            });
        }
    },
    computed: {
        isEmpty: function () {
            return this.model.media == null;
        }
    },
    mounted: function() {
        this.model.getTitle = function () {
            if (this.model.media != null) {
                return this.model.media.filename;
            } else {
                return "No media selected";
            }
        };
    },
    template:
        "<div class='media-field' :class='{ empty: isEmpty }'>" +
        "  <div class='media-picker'>" +
        "    <div class='btn-group float-right'>" +
        "      <button v-on:click.prevent='select' class='btn btn-primary text-center'>" +
        "        <i class='fas fa-plus'></i>" +
        "      </button>" +
        "      <button v-on:click.prevent='remove' class='btn btn-danger text-center'>" +
        "        <i class='fas fa-times'></i>" +
        "      </button>" +
        "    </div>" +
        "    <div class='card text-left'>" +
        "      <div class='card-body' v-if='isEmpty'>" +
        "        <span v-if='meta.placeholder != null' class='text-secondary'>{{ meta.placeholder }}</span>" +
        "        <span v-if='meta.placeholder == null' class='text-secondary'>&nbsp;</span>" +
        "      </div>" +
        "      <div class='card-body' v-else>" +
        "        <a href='#' v-on:click.prevent='piranha.preview.open(model.id)'>{{ model.media.filename }}</a>" +
        "      </div>" +
        "    </div>" +
        "  </div>" +
        "</div>"
});

Vue.component("string-field", {
    props: ["uid", "model", "meta"],
    methods: {
        update: function () {
            if (this.meta.notifyChange) {
                console.log("update field: ", {
                    uid: this.uid,
                    title: this.model.value
                });

                // Tell parent that value has been updated
                this.$emit('update-field', {
                    uid: this.uid,
                    title: this.model.value
                });
            }
        }
    },
    template:
        "<input class='form-control' type='text' :placeholder='meta.placeholder' v-model='model.value' v-on:change='update()'>"
});

Vue.component("html-field", {
    props: ["uid", "model"],
    data: function () {
        return {
            body: this.model.value
        };
    },
    methods: {
        onBlur: function (e) {
            this.model.value = e.target.innerHTML;
        }
    },
    computed: {
        isEmpty: function () {
            return piranha.utils.isEmptyHtml(this.model.value);
        }
    },
    mounted: function () {
        piranha.editor.addInline(this.uid);
    },
    beforeDestroy: function () {
        piranha.editor.remove(this.uid);
    },
    template:
        "<div class='html-field' :class='{ empty: isEmpty }'>" +
        "  <div contenteditable='true' :id='uid' spellcheck='false' v-html='body' v-on:blur='onBlur'></div>" +
        "</div>"
});

/*global
    piranha
*/

Vue.component("image-field", {
    props: ["uid", "model", "meta"],
    methods: {
        clear: function () {
            // clear media from block
        },
        select: function () {
            if (this.model.media != null) {
                piranha.mediapicker.open(this.update, "Image", this.model.media.folderId);
            } else {
                piranha.mediapicker.openCurrentFolder(this.update, "Image");
            }
        },
        remove: function () {
            this.model.id = null;
            this.model.media = null;
        },
        update: function (media) {
            if (media.type === "Image") {
                this.model.id = media.id;
                this.model.media = media;

                // Tell parent that title has been updated
                this.$emit('update-title', {
                    uid: this.uid,
                    title: this.model.media.filename
                });
            } else {
                console.log("No image was selected");
            }
        }
    },
    computed: {
        isEmpty: function () {
            return this.model.media == null;
        }
    },
    mounted: function() {
        this.model.getTitle = function () {
            if (this.model.media != null) {
                return this.model.media.filename;
            } else {
                return "No image selected";
            }
        };
    },
    template:
        "<div class='media-field' :class='{ empty: isEmpty }'>" +
        "  <div class='media-picker'>" +
        "    <div class='btn-group float-right'>" +
        "      <button v-on:click.prevent='select' class='btn btn-primary text-center'>" +
        "        <i class='fas fa-plus'></i>" +
        "      </button>" +
        "      <button v-on:click.prevent='remove' class='btn btn-danger text-center'>" +
        "        <i class='fas fa-times'></i>" +
        "      </button>" +
        "    </div>" +
        "    <div class='card text-left'>" +
        "      <div class='card-body' v-if='isEmpty'>" +
        "        <span v-if='meta.placeholder != null' class='text-secondary'>{{ meta.placeholder }}</span>" +
        "        <span v-if='meta.placeholder == null' class='text-secondary'>&nbsp;</span>" +
        "      </div>" +
        "      <div class='card-body' v-else>" +
        "        <a href='#' v-on:click.prevent='piranha.preview.open(model.id)'>{{ model.media.filename }}</a>" +
        "      </div>" +
        "    </div>" +
        "  </div>" +
        "</div>"
});

Vue.component("number-field", {
    props: ["uid", "model", "meta"],
    template:
        "<input class='form-control' type='text' :placeholder='meta.placeholder' v-model='model.value'>"
});

Vue.component("text-field", {
    props: ["uid", "model", "meta"],
    template:
        "<textarea class='form-control' rows='4' :placeholder='meta.placeholder' v-model='model.value'></textarea>"
});

Vue.component("missing-field", {
    props: ["meta", "model"],
    template:
        "<div class='alert alert-danger text-center' role='alert'>No component registered for <code>{{ meta.type }}</code></div>"
});

/*global
    piranha
*/

piranha.pageedit = new Vue({
    el: "#pageedit",
    data: {
        loading: true,
        id: null,
        siteId: null,
        parentId: null,
        sortOrder: 0,
        typeId: null,
        title: null,
        navigationTitle: null,
        slug: null,
        metaKeywords: null,
        metaDescription: null,
        published: null,
        state: "new",
        blocks: [],
        regions: [],
        editors: [],
        useBlocks: true,
        saving: false,
        savingDraft: false,
        selectedRegion: {
            uid: "uid-blocks",
            name: null,
            icon: null,
        },
        selectedSetting: "uid-settings"
    },
    computed: {
        contentRegions: function () {
            return this.regions.filter(function (item) {
                return item.meta.display != "setting" && item.meta.display != "hidden";
            });
        },
        settingRegions: function () {
            return this.regions.filter(function (item) {
                return item.meta.display === "setting";
            });
        },
    },
    methods: {
        bind: function (model) {
            this.id = model.id;
            this.siteId = model.siteId;
            this.parentId = model.parentId;
            this.sortOrder = model.sortOrder;
            this.typeId = model.typeId;
            this.title = model.title;
            this.navigationTitle = model.navigationTitle;
            this.slug = model.slug;
            this.metaKeywords = model.metaKeywords;
            this.metaDescription = model.metaDescription;
            this.published = model.published;
            this.state = model.state;
            this.blocks = model.blocks;
            this.regions = model.regions;
            this.editors = model.editors;
            this.useBlocks = model.useBlocks;

            if (!this.useBlocks) {
                // First choice, select the first custom editor
                if (this.editors.length > 0) {
                    this.selectedRegion = this.editors[0];
                }

                // Second choice, select the first content region
                else if (this.contentRegions.length > 0) {
                    this.selectedRegion = this.contentRegions[0].meta;
                }
            }
        },
        load: function (id) {
            var self = this;

            fetch(piranha.baseUrl + "manager/api/page/" + id)
                .then(function (response) { return response.json(); })
                .then(function (result) {
                    self.bind(result);
                })
                .catch(function (error) { console.log("error:", error );
            });
        },
        create: function (id, pageType) {
            var self = this;

            fetch(piranha.baseUrl + "manager/api/page/create/" + id + "/" + pageType)
                .then(function (response) { return response.json(); })
                .then(function (result) {
                    self.bind(result);
                })
                .catch(function (error) { console.log("error:", error );
            });
        },
        save: function ()
        {
            this.saving = true;
            this.saveInternal(piranha.baseUrl + "manager/api/page/save");
        },
        saveDraft: function ()
        {
            this.savingDraft = true;
            this.saveInternal(piranha.baseUrl + "manager/api/page/save/draft");
        },
        unpublish: function ()
        {
            this.saving = true;
            this.saveInternal(piranha.baseUrl + "manager/api/page/save/unpublish");
        },
        saveInternal: function (route) {
            var self = this;

            var model = {
                id: piranha.pageedit.id,
                siteId: piranha.pageedit.siteId,
                parentId: piranha.pageedit.parentId,
                sortOrder: piranha.pageedit.sortOrder,
                typeId: piranha.pageedit.typeId,
                title: piranha.pageedit.title,
                navigationTitle: piranha.pageedit.navigationTitle,
                slug: piranha.pageedit.slug,
                metaKeywords: piranha.pageedit.metaKeywords,
                metaDescription: piranha.pageedit.metaDescription,
                published: piranha.pageedit.published,
                blocks: JSON.parse(JSON.stringify(piranha.pageedit.blocks)),
                regions: JSON.parse(JSON.stringify(piranha.pageedit.regions))
            };

            fetch(route, {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(model)
            })
            .then(function (response) { return response.json(); })
            .then(function (result) {
                var oldState = self.state;

                self.id = result.id;
                self.slug = result.slug;
                self.published = result.published;
                self.state = result.state;

                if (oldState === 'new' && result.state !== 'new') {
                    window.history.replaceState({ state: "created"}, "Edit page", piranha.baseUrl + "manager/page/edit/" + result.id);
                }
                piranha.notifications.push(result.status);

                self.saving = false;
                self.savingDraft = false;
            })
            .catch(function (error) {
                console.log("error:", error);
            });
        },
        revert: function () {
            var self = this;

            fetch(piranha.baseUrl + "manager/api/page/revert/" + self.id)
                .then(function (response) { return response.json(); })
                .then(function (result) {
                    self.bind(result);

                    piranha.notifications.push(result.status);
                })
                .catch(function (error) { console.log("error:", error );
            });
        },
        remove: function () {
            var self = this;

            fetch(piranha.baseUrl + "manager/api/page/delete/" + self.id)
                .then(function (response) { return response.json(); })
                .then(function (result) {
                    piranha.notifications.push(result);

                    window.location = piranha.baseUrl + "manager/pages";
                })
                .catch(function (error) { console.log("error:", error ); });
        },
        addBlock: function (type, pos) {
            fetch(piranha.baseUrl + "manager/api/content/block/" + type)
                .then(function (response) { return response.json(); })
                .then(function (result) {
                    piranha.pageedit.blocks.splice(pos, 0, result.body);
                })
                .catch(function (error) { console.log("error:", error );
            });
        },
        moveBlock: function (from, to) {
            this.blocks.splice(to, 0, this.blocks.splice(from, 1)[0])
        },
        collapseBlock: function (block) {
            block.meta.isCollapsed = !block.meta.isCollapsed;
        },
        removeBlock: function (block) {
            var index = this.blocks.indexOf(block);

            if (index !== -1) {
                this.blocks.splice(index, 1);
            }
        },
        selectRegion: function (region) {
            this.selectedRegion = region;
        },
        selectSetting: function (uid) {
            this.selectedSetting = uid;
        }
    },
    created: function () {
    },
    updated: function () {
        if (this.loading)
        {
            sortable(".blocks", {
                handle: ".handle",
                items: ":not(.unsortable)"
            })[0].addEventListener("sortupdate", function (e) {
                piranha.pageedit.moveBlock(e.detail.origin.index, e.detail.destination.index);
            });
        }
        else {
            sortable(".blocks", "disable");
            sortable(".blocks", "enable");
        }

        this.loading = false;
    }
});
