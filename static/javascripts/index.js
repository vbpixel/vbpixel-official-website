function fetchPlayerList(){
    document.addEventListener('DOMContentLoaded', async () => {
        const serverStatusElement = document.getElementById('player-list');
    
        try {
        const response = await fetch('/.netlify/functions/getPlayerList');
        const data = await response.json();
    
        if (response.ok) {
            serverStatusElement.innerHTML = `<p>${data.message}</p>`;
        } else {
            serverStatusElement.innerHTML = `<p>服务器貌似离线了(</p>`;
        }
        } catch (error) {
        serverStatusElement.innerHTML = `<p>糟了！</p>``<p>错误信息:${error.message}</p>`;
        }
    });
}

// 页面加载完成后获取在线状态
$(document).ready(function() {
    fetchPlayerList();
});