// ========== uki oki 共享工具函数 ==========
// 适用于所有模块的通用工具函数（与 shared/brand.css、shared/components.css 配套）
// 使用方式：在模块 script.js 之前引入 <script src="../shared/utils.js" defer></script>

// ========== 数值处理 ==========

// 取整到 0.5 步进（例：3.2 → 3.0，3.3 → 3.5）
function roundToHalf(value) {
    return Math.round(value * 2) / 2;
}

// 包数格式化：整数不带小数点，非整数保留 1 位小数
function formatPacks(packs) {
    return Number.isInteger(packs) ? packs.toString() : packs.toFixed(1);
}

// ========== 环境判断 ==========

// 通过 UserAgent 判断是否为移动设备
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// ========== DOM 工具 ==========

// 通用选中切换：清除容器内所有选中态，选中 data-value 匹配的元素
// container: 容器元素 | selector: 选项选择器（如 '.option-btn'）| value: 目标 data-value
function toggleSelection(container, selector, value) {
    container.querySelectorAll(selector).forEach(el => el.classList.remove('selected'));
    const target = container.querySelector(`${selector}[data-value="${value}"]`);
    if (target) target.classList.add('selected');
}

// ========== 函数控制 ==========

// 防抖：停止触发 delay 毫秒后才真正执行 fn（适用于输入框实时计算等场景）
function debounce(fn, delay = 300) {
    let timer = null;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}
