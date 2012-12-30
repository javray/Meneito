enyo.kind({
    name: 'Descripcion',
    kind: 'Control',
    classes: 'enyo-border-box list-description onyx',
    components: [
        {name: 'description', style: 'width:80%;float:left'},
        {style: 'width:20%;float:right', components: [
            {name: 'thumb', kind: 'Image'}
        ]}
    ],
    published: {
        description: '',
        thumb: ''
    },
    descriptionChanged: function() {
        this.$.description.setContent(this.description);
    },
    thumbChanged: function() {
        this.$.thumb.setSrc(this.thumb);
    },
});

enyo.kind({
    name: 'Noticias',
    kind: 'PulldownList',
    fit: true,
    classes: 'enyo-fit onyx',
    toggleSelected: true,
    pullingMessage:'Desliza hacia abajo para refrescar...',
    pulledMessage: 'Suelta para refrescar...',
    loadingMessage: 'Cargando...',
    loadingIconClass: 'icon-cd loading pull',
    components: [
        {name:'principal', style: "padding: 10px;", classes: "enyo-border-box list-item", ontap: 'pulse', components: [
            {style: 'float:left;min-height:80px;width:55px', components:[
                {name: 'votes', classes: 'votes'}, 
                {tag:'br'},
                {name: 'comments', classes: 'icon-comment', style: 'color: orange;font-size:15px'},
            ]},
            {style: 'min-height:80px', components: [
                {name: "title"},
                {name: "domain", style: 'float:right;font-size:11px;color:lightsalmon'},
                {name: 'user', classes: 'icon-user', style: 'color: orange;font-size:11px;margin-top: 2px'}

            ]}
        ]},
        {name: 'controles', kind: 'Controles', showing: false },
        {name: 'descripcion', kind: 'Descripcion', style: 'padding: 10px', showing: false}
    ],
    published: {
        items:[] 
    },
    handlers: {
        onSetupItem: 'setupItem',
        onPullRelease: 'soltar',
        onPullComplete: 'completar',
        onSelect: 'seleccionado',
        onDeselect: 'deseleccionado'
    },
    events: {
        onPulsado: ''
    },
    deseleccionado: function(s, e) {
        var port = document.getElementById(this.id + '_port'),
            port_h = +(port.style.height.split('px')[0]);

        port.style.height = (port_h - this.tam) + 'px';

        if (e.index == this.items.length - 1 || e.index == this.items.length - 2) {
            this.scrollToBottom();
        }
    },
    seleccionado: function(s, e) {
        var port = document.getElementById(this.id + '_port'),
            port_h = +(port.style.height.split('px')[0]);

        this.tam = document.querySelector('[data-enyo-index="' + e.index + '"]').offsetHeight - 100;
        port.style.height = (port_h + this.tam) + 'px';

        if (e.index == this.items.length - 1 || e.index == this.items.length - 2) {
            this.scrollToBottom();
        }
    },
    itemsChanged: function() {
        var items = [];

        this.mostrados = [];

        this.items.forEach(function(e, i) {

            var description = e.description.split('<p>');
            var url = e.url.split('/');

            items[items.length] = {
                title: e.title,
                description: html_entity_decode(strip_tags(description[1])),
                votes: e.votes,
                comments: isNaN(e.comments[1]) ? e.comments[0] : e.comments[1],
                domain: url[2],
                url: e.url,
                murl: e.comments[0],
                thumb: e.thumbnail ? e.thumbnail.url : null,
                user: e.user,
                id: e.link_id
            };
        });

        this.items = items;

        this.setCount(this.items.length);

        if (this.pulled) {
            this.completePull();
        }
        else {
            this.reset();
        }
    },
    setupItem: function(s, e) {
        var index = e.index,
            item = this.items[index];

        if (this.items.length > 0) {

            this.$.title.setContent(item.title);
            this.$.descripcion.setDescription(item.description);
            this.$.votes.setContent(item.votes);
            this.$.comments.setContent(' ' + item.comments);
            this.$.user.setContent(' ' + item.user);
            this.$.domain.setContent(item.domain);

            if (e.originator.isSelected(index) && !this.$.descripcion.showing) {

                if (item.thumb != null) {
                    this.$.descripcion.setThumb(item.thumb);
                }
                else {
                    this.$.descripcion.setThumb('');
                }

                this.$.descripcion.show();
                this.$.controles.show();

                this.scrollToRow(index);

                this.$.controles.setSubject(item.title);
                this.$.controles.setText(item.url);
                this.$.controles.setCid(item.id);
                this.$.controles.setUrl(item.url);
                this.$.controles.setMurl(item.murl);

            }
            else {
                this.$.descripcion.hide();
                this.$.controles.hide();
            }
        }
    },
    soltar: function() {
        this.pulled = true;

		setTimeout(enyo.bind(this, function() {

		    enyo.Signals.send('onNoticias', {
                feed: this.name,
                obj: this
            });

		}), 1000);

    },
    completar: function() {
        this.pulled = false;
		this.reset();
    },
    pulse: function(s, e) {
       this.renderRow(e.index);
    },
});

enyo.kind({
    name: 'Peticiones',
    components: [
        {kind: 'Signals', onNoticias: 'noticias', onComments: 'comments'}
    ],
    comments: function(s, p) {
        var url = MENEAME.comentarios(p.id);

        var jsonp = new enyo.JsonpRequest({
                url: url,
                callbackName: 'callback'
        });

        jsonp.response(this, function(s, r) {
            p.obj.setItems(r.query.results.item);
        });

        jsonp.error(this, function(s, r) {
            enyo.Signals.send('onErrorComments', p.id);
        });

        jsonp.go();
    },
    noticias: function(s, p) {

        var url = MENEAME[p.feed];

        var jsonp = new enyo.JsonpRequest({
                url: url,
                callbackName: 'callback'
        });

        jsonp.response(this, function(s, r) {
            p.obj.setItems(r.query.results.item);
            enyo.Signals.send('onCargando');
        });

        jsonp.error(this, function(s, r) {
            enyo.Signals.send('onError', p.obj);
        });

        jsonp.go();

    }
});

enyo.kind({
    name: 'Secciones',
    kind: 'onyx.Toolbar',
    classes: 'onyx-toolbar-inline onyx',
    style: 'height: 57px;',
    components: [
        {name: 'portada', style: 'width: 50%;border-right:1px solid grey;height:57px;position:relative; bottom: 9px;text-align:center', classes: 'icono on',  components: [
            {style: '5px; font-size: 30px', classes: 'icon-newspaper'},
            {style: 'font-size: 10px', content: 'Portada'}
        ]},
        {name: 'pendientes', style: 'width: 50%;height: 57px;position:relative;bottom: 9px;text-align: center', classes: 'icono', components: [
            {style: 'font-size: 30px', classes: 'icono icon-list'},
            {style: 'font-size: 10px', content: 'Pendientes'}
        ]},
    ],
    handlers: {
        ontap: 'opcion'
    },
    opcion: function(s, e) {

        this.children.forEach(function(e, i) {
            e.removeClass('on');
        });

        s.addClass('on');
        enyo.Signals.send('onPanel', s.name);
    }
});

enyo.kind({
    name: 'Comentarios',
    kind: 'List',
    fit: true,
    classes: 'enyo-fit onyx',
    components: [
        {name:'principal', style: "padding: 10px;", classes: "enyo-border-box list-item-comments", components: [
            {style: 'float:left;height:40px;width:20%;font-weight:bold', components:[
                {name: 'orden', style: 'font-size:35px;margin-right:5px;color: orange'}, 
            ]},
            {name: 'contenido', showing: true, components: [
                {name: "descripcion", style: 'margin-left: 2px'},
                {components: [
                    {name: 'karma', classes: 'icon-thermometer', style: 'float: right;color: salmon;font-size:11px;margin: 2px 2px 0px 0px'},
                    {name: 'votes', classes: 'icon-flag', style: 'float: right;color: salmon;font-size:11px;margin: 2px 2px 0px 0px'},
                    {name: 'user', classes: 'icon-user', style: 'float: right; color: salmon;font-size:11px;margin: 2px 2px 0px 0px'}
                ]}
            ]}
        ]}
    ],
    published: {
        items:[]
    },
    handlers: {
        onSetupItem: 'setupItem',
        onScrollStop: 'scrollstop'
    },
    indice: 10,
    itemsChanged: function() {
        var items = []; 

        this.indice = 10;

        this.items.forEach(function(e, i) {
            var description = e.description.split('<p>');

            items.unshift({
                orden: e.order,
                descripcion: html_entity_decode(strip_tags(description[1])),
                user: e.user,
                votes: e.votes,
                karma: e.karma
            });
        });

        this.items = items;
        this.indice = this.indice > items.length ? items.length : this.indice;

        this.setCount(this.indice);
        this.reset();

    },
    setupItem: function(s, e) {
        var index = e.index,
            item = this.items[index];

        if (this.items.length > 0) {
            this.$.orden.setContent(item.orden);
            this.$.descripcion.setContent(item.descripcion);
            this.$.user.setContent(' ' + item.user);
            this.$.votes.setContent(' ' + item.votes);
            this.$.karma.setContent(' ' + item.karma);

        }
    },
    scrollstop: function(s, e) {
        var datos = this.getScrollBounds(),
            indice = this.indice,
            len = this.items.length;

        if (datos.top == datos.maxTop && !this.moring && indice < len) {
            this.moring = true;
            indice += 10;
            this.indice = indice  > len ? len : indice;
            this.setCount(this.indice);
            this.refresh();
            this.moring = false;
        }
    }
});

enyo.kind({
    name: 'Cargando',
    kind: 'Control',
    style: 'font-size: 15px;margin: 20px 0px 20px 35px',
    components: [
        {tag: 'span', classes: 'icon-cd loading', style: 'position: absolute;font-size:20px;height:20px;width:20px;top:70px'},
        {style: 'position: relative;left: 43px;bottom: 5px;', content: 'Cargando...'}
    ]
});

enyo.kind({
    name: 'Error',
    kind: 'Control',
    style: 'font-size: 15px; margin: 20px 0px 20px 35px',
    components: [
        {tag: 'span', classes: 'icon-cross', style: 'position: absolute;font-size:20px;height:20px;width:20px;top:70px'},
        {style: 'position: relative;left: 43px;bottom: 5px;font-size:13px', content: 'Ha ocurrido un error, pulsa para volver a intentarlo'}
    ],
    published: {
        pagina: ''
    }
});

enyo.kind({
    name: 'ErrorComments',
    kind: 'Control',
    style: 'font-size: 15px; margin: 20px 0px 20px 35px;position:absolute; z-index: 1',
    components: [
        {tag: 'span', classes: 'icon-cross', style: 'position: absolute;font-size:20px;height:20px;width:20px;bottom:6px'},
        {style: 'position: relative;left: 43px;bottom: 5px;font-size:13px', content: 'Ha ocurrido un error, pulsa para volver a intentarlo'}
    ],
    published: {
        pagina: ''
    }
});


enyo.kind({
    name: 'Controles',
    kind: 'Control',
    style: 'background: rgba(255, 160, 122, 0.1); height: 40px;',
    classes: 'onyx',
    published: {
        cid: '',
        subject: '',
        text: '',
        url: '',
        murl: ''
    },
    components: [
        {classes: 'icon-comment control', ontap: 'comments'}, 
        {classes: 'icon-forward control', ontap: 'noticia'},
        {classes: 'icon-network control', ontap: 'noticia_m'},
        {classes: 'icon-share control', ontap: 'share'}
    ],
    comments: function() {
        enyo.Signals.send('onComentarios', this.cid);
    },
    noticia: function() {
        MENEAME.plataformas[MENEAME.plataforma].showPage(this.url);
    },
    noticia_m: function() {
        MENEAME.plataformas[MENEAME.plataforma].showPage(this.murl);
    },
    share: function() {
        MENEAME.plataformas[MENEAME.plataforma].share(this.subject, this.text);
    }

});

enyo.kind({
	name: "App",
    kind: "FittableRows", 
	classes: "enyo-fit onyx", 
	fit: true,
	components:[
        {kind: "onyx.Toolbar", classes: "onyx-menu-toolbar", style: 'height: 40px', components: [
			{classes: 'logo', content: "Meneito"},
            {name: 'volverb', classes: 'icon-arrow-left volver', showing: false, ontap: 'volver'}
		]},
        {name: 'paginas', kind: 'Panels', fit: true, draggable: false, animate: false, realtimeFit: true, classes: 'enyo-border-box', components: [
            {kind: 'FittableRows', classes: 'enyo-fit onyx', components: [
                {kind: 'Secciones'},
                {name: 'cargando', kind: 'Cargando', showing: false},
                {name: 'error', kind: 'Error', showing: false, ontap: 'reintentar'},
                {name: 'paneles', kind: "Panels", fit:true, draggable: false, animate: false, realtimeFit: true, classes: "enyo-border-box", components: [
                    {name: 'portada', kind: "Noticias", onPulsado: 'pulsado'},
                    {name: 'pendientes', kind: "Noticias", onPulsado: 'pulsado'},
                ]},
            ]},
            {components: [
                {name: 'errorComentarios', kind: 'ErrorComments', showing: false, ontap: 'reintentarComentarios'},
                {name: 'comentarios', kind: 'Comentarios'}
            ]}
        ]},
        {kind: 'Peticiones', classes: 'onyx'},
        {kind: 'Signals', onPanel: 'panel', onComentarios: 'showComments', onbackbutton: 'back', onCargando:'cargando', onError: 'error', onErrorComments: 'errorComments', ondeviceready: "deviceReady"}
	],
	errorComments: function(s, p) {
	    this.$.errorComentarios.setPagina(p);
	    this.$.errorComentarios.show();
    },
    reintentarComentarios: function() {
        this.$.errorComentarios.hide();

        enyo.Signals.send('onComments', {
            id: this.$.errorComentarios.pagina,
            obj: this.$.comentarios
        });
    },
	error: function(s, p) {

	    this.$.cargando.hide();
	    this.$.error.setPagina(p.name);
	    this.$.error.show();

	    if (p.pulled) {
	        p.pulled = false;
	        p.completePull();
        }
    },
    reintentar: function() {
        this.$.error.hide();
        this.$.cargando.show();

        enyo.Signals.send('onNoticias', {
            feed: this.$.error.pagina,
            obj: this.$[this.$.error.pagina]
        });
    },
	deviceReady: function() {
	    MENEAME.plataformas[MENEAME.plataforma].ready();
    },
    volver: function() {
        this.$.paginas.setIndex(0);
        this.$.volverb.hide();
    },
	back: function(e) {
	    if (this.$.paginas.getIndex() == 0) {
	        navigator.app.exitApp();
        }
        else {
	        this.$.paginas.setIndex(0);
            this.$.volverb.hide();
        }
    },
    cargando: function() {
        this.$.cargando.hide();
        this.$.error.hide();
    },
	panel: function(s, p) {

        this.$.error.hide();

	    if (this.$.paneles.getIndex() != MENEAME.secciones[p]) {

            this.$.paneles.setIndex(MENEAME.secciones[p]);

            this.$.cargando.show();

            enyo.Signals.send('onNoticias', {
                feed: p,
                obj: this.$[p]
            });
        }
    },
    showComments: function(s, p) {
        this.$.comentarios.setCount(0);
        enyo.Signals.send('onComments', {
            id: p,
            obj: this.$.comentarios
        });
        this.$.paginas.setIndex(1);
        this.$.volverb.show();
    },
	rendered: function() {
	    this.inherited(arguments);

        this.$.cargando.show();

	    enyo.Signals.send('onNoticias', {
	        feed: 'portada',
	        obj: this.$.portada
        });
    },
});

(function(window, undefined) {
    var MENEAME = window.MENEAME || {};

    var ant = 'http://query.yahooapis.com/v1/public/yql?q=',
        post = '&format=json';

    var userAgent = window.navigator.userAgent;

    MENEAME.portada = ant + encodeURIComponent("select * from rss where url = 'http://www.meneame.net/rss2.php'") + post;
    MENEAME.pendientes = ant + encodeURIComponent("select * from rss where url = 'http://www.meneame.net/rss2.php?status=queued'") + post;

    MENEAME.comentarios = function(id) {
        return ant + encodeURIComponent("select * from rss where url = 'http://www.meneame.net/comments_rss2.php?id=" + id + "'") + post;
    }

    MENEAME.secciones = {
        portada: 0,
        pendientes: 1
    }

    switch (true) {
        case (userAgent.match(/Android/) != null):
            MENEAME.plataforma = 'Android';
            break;
        case (userAgent.match(/iPhone|iPad|iPod/) != null):
            MENEAME.plataforma = 'iOS';
            break;
        default:
            MENEAME.plataforma = 'default';
            break;
    }

    MENEAME.plataformas = {
        Android: {
            ready: function() {
                enyo.dispatcher.listen(document, "backbutton");
            },
            showPage: function(url) {
                window.plugins.childBrowser.showWebPage(url, { showLocationBar: false});
            },
            share: function(subject, text) {
                window.plugins.share.show({
                    subject: subject,
                    text: text},
                    function() {}, // Success function
                    function() {alert('Share failed')} // Failure function
                );
            }
        },
        iOS: {
            ready: function() {
	            ChildBrowser.install();
            },
            showPage: function(url) {
                var cb =  window.plugins.childBrowser;
                cb.onLocationChange = function(){ };
		        cb.onClose = function(){ };
		        cb.onOpenExternal = function(){};
                cb.showWebPage(url);
            },
            share: function(subject, text) {
                navigator.notification.alert('Funcionalidad en desarrollo, sé paciente :-)', function(){}, 'Meneito');
                //window.plugins.shareKit.share(subject, text);
            }
        },
        default: {
            ready: function() {
            },
            showPage: function(url) {
                window.open(url);
            },
            share: function(subject, text) {
            }
        }
    }

    window.MENEAME = MENEAME;
})(window);
