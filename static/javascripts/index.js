async function getPlayerList() {
    const serverStatusElement = document.getElementById('player-list');
    const timeout = 5000; // 5秒超时
    let timeoutId;

    const fetchWithTimeout = async (resource, options = {}) => {
        const { timeout = 8000 } = options;

        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    };

    const fetchData = async () => {
        try {
            const response = await fetchWithTimeout('/.netlify/functions/getPlayerList', { timeout });
            const data = await response.json();

            if (response.ok) {
                serverStatusElement.innerHTML = data.message.replace(/\n/g, '<br>');
            } else {
                serverStatusElement.innerHTML = '服务器貌似离线了';
            }
        } catch (error) {
            serverStatusElement.innerHTML = `糟了！错误信息: ${error.message}`;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(fetchData, timeout); // 超时后重新尝试
        }
    };

    fetchData();
}

document.addEventListener('DOMContentLoaded', getPlayerList);