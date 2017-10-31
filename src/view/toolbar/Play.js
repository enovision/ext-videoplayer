/**
 * Created by jvandemerwe on 4-8-2017.
 */
Ext.define('VideoPlayer.view.toolbar.Play', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'VideoPlayerPlayTbar',
    controller: 'VideoPlayerPlayController',

    requires: [
        'VideoPlayer.singleton.Util',
        'VideoPlayer.view.toolbar.PlayController'
    ],

    hidePlaylist: true,
    hideUrl: true,
    hideRecent: true,

    videojs: null,

    defaults: {
        xtype: 'button'
    },

    initComponent: function () {
        Ext.apply(this, {
            items: [{
                iconCls: vpUtil.getPlay(), /* play */
                iconPlay: vpUtil.getPlay(),
                iconPause: vpUtil.getPause(),
                tooltip: 'Click to Play',
                reference: 'btnPlay',
                listeners: {
                    click: 'onPlayClicked'
                }
            }, {
                iconCls: vpUtil.getStop(), /* stop */
                reference: 'btnStop',
                listeners: {
                    click: 'onStopClicked'
                }
            }, {
                xtype: 'splitter',
                hidden: this.hidePlaylist
            }, {
                iconCls: vpUtil.getUrlLoad(),
                hidden: this.hideUrl,
                tooltip: 'Open URL',
                listeners: {
                    click: 'onUrlLoadClicked'
                }
            }, {
                iconCls: vpUtil.getRecent(),
                reference: 'RecentPlayed',
                hidden: this.hideRecent,
                tooltip: 'Recently played',
                menu: Ext.create('Ext.menu.Menu', {
                    reference: 'RecentMenu',
                    items: [{
                        text: 'Clear list',
                        deleteMe: false,
                        handler: 'onClearRecent'
                    }, '-']
                })
            }, {
                iconCls: vpUtil.getPlaylist(), /* stop */
                tooltip: 'Playlist',
                reference: 'Playlist',
                hidden: this.hidePlaylist,
                menu: Ext.create('Ext.menu.Menu', {
                    reference: 'PlaylistMenu'
                })
            }, '->', {
                iconCls: vpUtil.getCC(),
                tooltip: 'CC',
                reference: 'btnSubtitles',
                hidden: true,
                //enableToggle : true,
                menu: Ext.create('Ext.menu.Menu', {
                    reference: 'CaptionsMenu',
                    items: [{
                        text: 'Off',
                        deleteMe: false,
                        handler: 'onCaptionOffClicked'
                    }, '-']
                })
            }, {
                iconCls: vpUtil.getFullScreen(), /* stop */
                tooltip: 'Fullscreen',
                listeners: {
                    click: 'onFullScreenClicked'
                }
            }]
        });

        this.callParent();
    },

    setPlayBtn: function(state) {
        this.fireEvent('onSetPlayBtn', state);
    }

});