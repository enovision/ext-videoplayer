/**
 * Created by jvandemerwe on 4-8-2017.
 */
Ext.define('VideoPlayer.store.Playlist', {
    extend: 'Ext.data.Store',
    fields: ['id', 'src', 'tracks', 'poster'],
    proxy: {
        type: 'memory',
        id: 'VideoPlayerPlaylist'
    }
});