document.addEventListener('DOMContentLoaded', async () => {
        const serverStatusElement = document.getElementById('player-list');
        const timeout = 10000; // 5秒超时
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
                    serverStatusElement.innerHTML = `<p>${data.message}</p>`;
                } else {
                    serverStatusElement.innerHTML = `<p>服务器貌似离线了(</p>`;
                }
            } catch (error) {
                serverStatusElement.innerHTML = `<p>糟了！</p><p>错误信息:${error.message}</p>`;
                clearTimeout(timeoutId);
                timeoutId = setTimeout(fetchData, timeout); // 超时后重新尝试
            }
        };

        fetchData();
    });