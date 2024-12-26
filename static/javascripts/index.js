function fetchOnlinePlayers() {
    const serverIp = 'mc.vbpixel.cn';
    const apiUrl = `https://list.mczfw.cn/api/${serverIp}`;

    $.getJSON(apiUrl, function(data) {
        if (data.p !== undefined) {
            const playersOnline = data.p;
            const maxPlayers = data.mp;
            if (data.ping != null){
                $('#server-status').html(`服务器状态：在线 | 当前人数：${playersOnline}/${maxPlayers}`);
            }else {
                $('#server-status').html(`服务器状态：离线`);
            }
        } else {
            $('#server-status').html('无法获取服务器状态');
        }
    }).fail(function() {
        $('#server-status').html('无法连接到服务器');
    });
}

// 页面加载完成后获取在线状态
$(document).ready(function() {
    fetchOnlinePlayers();
});