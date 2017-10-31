/**
 * Created by jvandemerwe on 4-8-2017.
 */
Ext.define('VideoPlayer.view.window.PlayerWindow', {
    extend: 'Ext.window.Window',
    xtype: 'VideoPlayerWindow',

    requires: [
        'VideoPlayer.view.panel.Player'
    ],

    alternateClassName: ['VideoPlayerWindow'],

    closeable: true,
    maximizable: true,

    layout: 'fit',
    title: 'Ext JS Videoplayer',
    modal: true,

    /**
     * delegated settings
     */
    bodyBackgroundColor: '#000',
    initVolume: 0.2,
    autoPlayVideo: true,
    autoLoadVideo: true,
    enableYoutube: false,
    enableVimeo: false,
    tracks: false,
    video: false,
    videos: false,
    showUrlLoad: true,
    showPlaylist: true,
    showRecent: true,

    width: false,
    height: false,

    initComponent: function () {
        var me = this;

        if (me.width === false) {
            me.setWindowSize(0.8);
        }

        Ext.apply(me, {
            items: [{
                xtype: 'VideoPlayerPanel',
                bodyBackgroundColor: me.bodyBackgroundColor,
                initVolume: me.initVolume,
                autoPlayVideo: me.autoPlayVideo,
                autoLoadVideo: me.autoLoadVideo,
                enableYoutube: me.enableYoutube,
                enableVimeo: me.enableVimeo,
                tracks: me.tracks,
                video: me.video,
                videos: me.videos,
                showUrlLoad: me.showUrlLoad,
                showPlaylist: me.showPlaylist,
                showRecent: me.showRecent
            }]
        });
        me.callParent(arguments);
    },

    setWindowSize: function (scale) {
        var me = this;
        me.height = Math.round(window.innerHeight * scale);
        me.width = Math.round((me.height / 3) * 4);

        if (me.width >= window.innerWidth) {
            me.setWindowSize(scale - 0.05);
        }
    }
});