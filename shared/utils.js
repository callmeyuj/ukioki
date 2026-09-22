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

// ========== 共享产品数据（单一数据源） ==========
// 犬猫鲜食口味列表，不含"平均数据"行（平均热量按需计算，避免维护两份数据）
// 各模块通过 getFlavors(petType) / getAvgKcal(petType) 访问
const PRODUCT_DATA = Object.freeze({
    dog: Object.freeze([
        { id: 'chicken_cod',     name: '鸡肉鳕鱼',   grams: 120, kcal: 121, price: 18.8 },
        { id: 'pork_blueberry',  name: '猪肉蓝莓',   grams: 120, kcal: 149, price: 22.8 },
        { id: 'beef_oyster',     name: '牛肉牡蛎',   grams: 120, kcal: 144, price: 25.8 },
        { id: 'venison',         name: '珍萃鹿肉',   grams: 120, kcal: 154, price: 29.8 },
        { id: 'duck_winter',     name: '鸭肉冬瓜梨', grams: 120, kcal: 130, price: 19.8 }
    ]),
    cat: Object.freeze([
        { id: 'chicken_cod',    name: '鸡肉鳕鱼', grams: 80, kcal: 107, price: null },
        { id: 'pork_blueberry', name: '猪肉蓝莓', grams: 80, kcal: 111, price: null },
        { id: 'beef_oyster',    name: '嫩牛牡蛎', grams: 80, kcal: 127, price: null },
        { id: 'venison',        name: '野牧鹿肉', grams: 80, kcal: 132, price: null }
    ])
});

// 宠物类型基础信息（icon / label），跨模块共用
const PET_CONFIG = Object.freeze({
    dog: Object.freeze({ icon: '🐶', label: '犬' }),
    cat: Object.freeze({ icon: '🐱', label: '猫' })
});

// 取指定宠物类型的口味列表（返回原始数组引用，调用方不要修改）
function getFlavors(petType) {
    return PRODUCT_DATA[petType] || [];
}

// 计算指定宠物类型的平均单包热量（动态从口味列表算，不维护单独常量）
function getAvgKcal(petType) {
    const flavors = getFlavors(petType);
    if (!flavors.length) return 0;
    return flavors.reduce((sum, f) => sum + f.kcal, 0) / flavors.length;
}

// ========== 格式化工具 ==========

// 金额格式化：¥ 1,345.12（千位分隔 + 2 位小数）
function formatMoney(v) {
    const parts = v.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return '¥ ' + parts.join('.');
}

// 日期格式化：YYYY/MM/DD（传入 Date 对象，默认当前日期）
function formatDate(date) {
    const d = date || new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '/' + m + '/' + day;
}
