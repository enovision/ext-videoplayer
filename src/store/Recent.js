Ext.define('VideoPlayer.store.Recent', {
    extend: 'Ext.data.Store',
    requires: [
        'Ext.data.proxy.LocalStorage'
    ],
    fields: ['id', 'video'],
    proxy: {
        type: 'localstorage',
        id: 'VideoPlayerRecent'
    }
});