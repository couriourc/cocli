/**
 * 交互式 CLI 工具（对标 shadcn 的极简交互）
 * 支持模糊搜索、快捷键操作、默认选项一键确认
 */

class InteractiveCLI {
  /**
   * 模糊搜索并选择模板项
   * @param {Array} items - 可选项列表 [{name, description, type}]
   * @param {string} query - 搜索查询
   * @returns {Promise<string>} 选中的项名称
   */
  static async searchAndSelect(items, query = '', options = {}) {
    // 如果没有 inquirer，使用简单的 readline
    try {
      const inquirer = require('inquirer');
      return await this.searchWithInquirer(items, query, options);
    } catch (error) {
      // 降级到简单交互
      return await this.searchSimple(items, query, options);
    }
  }

  /**
   * 使用 inquirer 进行交互式搜索
   */
  static async searchWithInquirer(items, query, options) {
    const inquirer = require('inquirer');
    
    // 如果提供了查询，先过滤（简单模糊匹配）
    let filteredItems = items;
    if (query) {
      const queryLower = query.toLowerCase();
      filteredItems = items.filter(item => {
        const nameMatch = item.name.toLowerCase().includes(queryLower);
        const descMatch = item.description && item.description.toLowerCase().includes(queryLower);
        const typeMatch = item.type && item.type.toLowerCase().includes(queryLower);
        return nameMatch || descMatch || typeMatch;
      });
      
      // 如果安装了 fuse.js，使用更高级的模糊搜索
      try {
        const Fuse = require('fuse.js');
        const fuse = new Fuse(items, {
          keys: ['name', 'description', 'type'],
          threshold: 0.4,
        });
        const results = fuse.search(query);
        filteredItems = results.map(r => r.item);
      } catch (error) {
        // fuse.js 未安装，使用简单匹配
      }
    }

    if (filteredItems.length === 0) {
      throw new Error(`未找到匹配项: ${query}`);
    }

    // 如果有默认选项且只有一个匹配项，直接返回
    if (options.default && filteredItems.length === 1) {
      return filteredItems[0].name;
    }

    const choices = filteredItems.map(item => ({
      name: `${item.name}${item.description ? ` - ${item.description}` : ''} (${item.type})`,
      value: item.name,
      short: item.name,
    }));

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'item',
        message: options.message || '选择模板项:',
        choices,
        pageSize: 10,
        default: options.default,
      },
    ]);

    return answer.item;
  }

  /**
   * 简单交互（不使用 inquirer）
   */
  static async searchSimple(items, query, options) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve, reject) => {
      // 如果提供了查询，过滤项
      let filteredItems = items;
      if (query) {
        const queryLower = query.toLowerCase();
        filteredItems = items.filter(item =>
          item.name.toLowerCase().includes(queryLower) ||
          (item.description && item.description.toLowerCase().includes(queryLower))
        );
      }

      if (filteredItems.length === 0) {
        rl.close();
        reject(new Error(`未找到匹配项: ${query}`));
        return;
      }

      // 如果只有一个匹配项，直接返回
      if (filteredItems.length === 1) {
        rl.close();
        resolve(filteredItems[0].name);
        return;
      }

      // 显示选项
      console.log('\n可选项:');
      filteredItems.forEach((item, index) => {
        const desc = item.description ? ` - ${item.description}` : '';
        console.log(`  ${index + 1}. ${item.name}${desc} (${item.type})`);
      });

      rl.question(`\n${options.message || '请选择'} (1-${filteredItems.length}): `, (answer) => {
        rl.close();
        const index = parseInt(answer) - 1;
        if (index >= 0 && index < filteredItems.length) {
          resolve(filteredItems[index].name);
        } else {
          reject(new Error('无效的选择'));
        }
      });
    });
  }

  /**
   * 确认操作
   */
  static async confirm(message, defaultValue = true) {
    try {
      const inquirer = require('inquirer');
      const answer = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmed',
          message,
          default: defaultValue,
        },
      ]);
      return answer.confirmed;
    } catch (error) {
      // 降级到简单交互
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      return new Promise((resolve) => {
        const defaultText = defaultValue ? 'Y/n' : 'y/N';
        rl.question(`${message} (${defaultText}): `, (answer) => {
          rl.close();
          if (!answer.trim()) {
            resolve(defaultValue);
          } else {
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
          }
        });
      });
    }
  }

  /**
   * 多选
   */
  static async checkbox(message, choices, defaultSelected = []) {
    try {
      const inquirer = require('inquirer');
      const answer = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'selected',
          message,
          choices,
          default: defaultSelected,
        },
      ]);
      return answer.selected;
    } catch (error) {
      // 降级到简单交互
      console.log(message);
      choices.forEach((choice, index) => {
        const marker = defaultSelected.includes(choice.value) ? '[x]' : '[ ]';
        console.log(`  ${marker} ${index + 1}. ${choice.name}`);
      });
      console.log('提示: 多选功能需要安装 inquirer 包');
      return defaultSelected;
    }
  }
}

module.exports = InteractiveCLI;

