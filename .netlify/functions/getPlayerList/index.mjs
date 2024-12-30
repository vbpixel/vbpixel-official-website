import { MinecraftServerListPing } from 'minecraft-status';
import axios from 'axios';

const serverOptions = {
  host: 'service.catpixel.cn',
  port: 10201,
  timeout: 3000,
};

exports.handler = async function(event, context) {
  try {
    // 获取出口 IP 地址
    const ipResponse = await axios.get('https://api.ipify.org?format=json');
    const exitIp = ipResponse.data.ip;

    // 获取 Minecraft 服务器状态
    const response = await MinecraftServerListPing.ping(4, serverOptions.host, serverOptions.port, serverOptions.timeout);
    const players = response.players;
    let message;
    if (players.online > 0) {
      message = '当前在线玩家列表:\n';
      players.sample.forEach(player => {
        message += `${player.name}\n`;
      });
    } else {
      message = '暂无玩家在线';
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ message, exitIp }),
    };
  } catch (error) {
    // 获取出口 IP 地址，即使在发生错误时
    const ipResponse = await axios.get('https://api.ipify.org?format=json');
    const exitIp = ipResponse.data.ip;

    return {
      statusCode: 500,
      body: JSON.stringify({ error: '查询玩家列表出现错误: ' + error.message, exitIp }),
    };
  }
};