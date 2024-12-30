import { MinecraftServerListPing } from 'minecraft-status';

const serverOptions = {
  host: 'service.catpixel.cn',
  port: 10201,
  timeout: 3000,
};

exports.handler = async function(event, context) {
  try {
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
      body: JSON.stringify({ message }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '查询玩家列表出现错误: ' + error.message }),
    };
  }
};