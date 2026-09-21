/* ========== uki oki 订阅计划 — 主逻辑 ========== */

/* ========== 常量 ========== */

/** 折扣阶梯 & 免邮规则 */
const PLAN_RULES = {
    minPacks: 30,
    packsPerFreeDelivery: 30,
    tiers: [
        { min: 30,  rate: 0.85 },
        { min: 90,  rate: 0.80 },
        { min: 150, rate: 0.75 },
        { min: 210, rate: 0.70 }
    ],
    calorieDeviationThreshold: 0.2   // 热量偏差 > 20% 时提示
};

/** 产品数据（犬 V1；猫预留 null） */
const PRODUCT_DATA = {
    dog: {
        flavors: [
            { id: 'chicken_cod',    name: '鸡肉鳕鱼',   grams: 120, kcal: 121, price: 18.8 },
            { id: 'pork_blueberry', name: '猪肉蓝莓',   grams: 120, kcal: 149, price: 22.8 },
            { id: 'beef_oyster',    name: '牛肉牡蛎',   grams: 120, kcal: 144, price: 25.8 },
            { id: 'venison',        name: '珍萃鹿肉',   grams: 120, kcal: 154, price: 29.8 },
            { id: 'duck_winter',    name: '鸭肉冬瓜梨', grams: 120, kcal: 130, price: 19.8 }
        ],
        avgKcal: 140
    },
    cat: null   // V2 扩展
};

/* ========== 状态 ========== */

const state = {
    subscription: {
        petType: 'dog',
        packs: 0,          // A：订阅包数（必填，唯一计算基准）
        dailyPacks: 0,     // B：每日包数（选填，辅助参考）
        days: 0,           // C：订阅天数（选填，辅助参考）
        simulatedPacks: 0  // D：= ⌈B×C⌉（只读，不可直接编辑）
    },
    allocation: {},        // { flavorId: packCount }
    delivery: {
        times: 0           // Screen 3 UI 暂隐藏，字段保留
    },
    returnContext: {
        fromPlan: false,   // 是否从 plan/ 跳转 calories/ 后回程
        targetKcal: 0      // 回程带入的目标热量（kcal）
    }
};

/* ========== DOM 缓存 ========== */

const els = {};

function cacheDom() {
    // Screen 1
    els.petOptions       = document.getElementById('petOptions');
    els.sectionPacks     = document.getElementById('section-packs');
    els.packsInput       = document.getElementById('packsInput');
    els.packsHint        = document.getElementById('packsHint');
    els.dailyPacksInput  = document.getElementById('dailyPacksInput');
    els.goCaloriesBtn    = document.getElementById('goCaloriesBtn');
    els.dayOptions       = document.getElementById('dayOptions');
    els.customDaysInput  = document.getElementById('customDaysInput');
    els.simulateResult   = document.getElementById('simulateResult');
    els.simulatedPacksValue = document.getElementById('simulatedPacksValue');
    els.adoptSimBtn      = document.getElementById('adoptSimBtn');
    els.freeDeliveryCount = document.getElementById('freeDeliveryCount');
    els.shippingInfo     = document.getElementById('shippingInfo');
    els.btnNext1         = document.getElementById('btnNext1');

    // Screen 2
    els.btnBack2         = document.getElementById('btnBack2');
    els.btnEvenSplit     = document.getElementById('btnEvenSplit');
    els.btnClearAll      = document.getElementById('btnClearAll');
    els.flavorList       = document.getElementById('flavorList');
    els.allocatedCount   = document.getElementById('allocatedCount');
    els.totalCount       = document.getElementById('totalCount');
    els.allocationHint   = document.getElementById('allocationHint');
    els.priceOriginal    = document.getElementById('priceOriginal');
    els.priceValue       = document.getElementById('priceValue');
    els.priceRate        = document.getElementById('priceRate');
    els.calorieDeviation = document.getElementById('calorieDeviation');
    els.deviationText    = document.getElementById('deviationText');
    els.btnNext2         = document.getElementById('btnNext2');

    // Screen 3
    els.btnBack3         = document.getElementById('btnBack3');
    els.snapshotPreview  = document.getElementById('snapshotPreview');
    els.snapshotCard     = document.getElementById('snapshotCard');
    els.snapPet          = document.getElementById('snapPet');
    els.snapPacks        = document.getElementById('snapPacks');
    els.snapDiscount     = document.getElementById('snapDiscount');
    els.snapFlavorList   = document.getElementById('snapFlavorList');
    els.snapOriginalPrice = document.getElementById('snapOriginalPrice');
    els.snapTotalPrice   = document.getElementById('snapTotalPrice');
    els.snapDate         = document.getElementById('snapDate');
    els.btnContactService = document.getElementById('btnContactService');
    els.btnRestart       = document.getElementById('btnRestart');

    // 通用
    els.imagePreviewModal = document.getElementById('imagePreviewModal');
    els.imagePreviewImg   = document.getElementById('imagePreviewImg');
    els.imagePreviewClose = document.getElementById('imagePreviewClose');
    els.toast             = document.getElementById('toast');
}

/* ========== 工具函数 ========== */

function fmtMoney(v) {
    return '¥ ' + v.toFixed(2);
}

/** 折扣率 → "X折"（0.85 → "8.5折"，0.80 → "8折"） */
function fmtDiscount(rate) {
    const zhe = rate * 10;
    const s = zhe % 1 === 0 ? zhe.toString() : zhe.toFixed(1);
    return s + '折';
}

/* ========== 纯函数（不依赖 state，便于测试） ========== */

/** 免邮次数 = ⌊packs / packsPerFreeDelivery⌋ */
function calcFreeDelivery(packs, packsPerFreeDelivery) {
    if (packs < packsPerFreeDelivery) return 0;
    return Math.floor(packs / packsPerFreeDelivery);
}

/** 模拟包数 = ⌈dailyPacks × days⌉ */
function calcSimulatedPacks(dailyPacks, days) {
    if (dailyPacks <= 0 || days <= 0) return 0;
    return Math.ceil(dailyPacks * days);
}

/** 均分：总数均摊到 N 种口味，余数优先挂靠单价低的口味 */
function calcEvenSplit(total, flavors) {
    const n = flavors.length;
    if (n === 0 || total <= 0) return {};
    const base = Math.floor(total / n);
    const remainder = total % n;

    // 按单价升序排列，余数依次分给最便宜的口味
    const sorted = [...flavors].sort((a, b) => a.price - b.price);

    const result = {};
    for (const f of flavors) result[f.id] = base;
    for (let i = 0; i < remainder; i++) {
        result[sorted[i].id] += 1;
    }
    return result;
}

/** 原价总价 = Σ(口味包数 × 单价) */
function calcOriginalPrice(allocation, flavors) {
    let total = 0;
    for (const f of flavors) {
        total += (allocation[f.id] || 0) * f.price;
    }
    return total;
}

/** 按总包数查找折扣阶梯 */
function getDiscountTier(packs, tiers) {
    let matched = null;
    for (const t of tiers) {
        if (packs >= t.min) matched = t;
    }
    return matched;
}

/** 当前分配总包数 */
function sumAllocation(allocation) {
    return Object.values(allocation).reduce((s, v) => s + (v || 0), 0);
}

/** 当前分配总热量 */
function calcTotalKcal(allocation, flavors) {
    let kcal = 0;
    for (const f of flavors) {
        kcal += (allocation[f.id] || 0) * f.kcal;
    }
    return kcal;
}

/** 某口味可分配上限 = 总包数 − 其它口味之和 */
function flavorUpperLimit(flavorId, totalPacks, allocation) {
    let otherSum = 0;
    for (const [id, count] of Object.entries(allocation)) {
        if (id !== flavorId) otherSum += (count || 0);
    }
    return totalPacks - otherSum;
}

/* ========== 渲染函数 ========== */

/** Screen 1：订阅包数校验 & 下一步按钮 */
function renderPacks() {
    const val = parseFloat(els.packsInput.value) || 0;
    state.subscription.packs = val;

    if (val > 0 && val < PLAN_RULES.minPacks) {
        els.packsHint.classList.add('show');
    } else {
        els.packsHint.classList.remove('show');
    }

    els.btnNext1.disabled = val < PLAN_RULES.minPacks;
    renderShippingInfo();
}

/** Screen 1：免邮信息 */
function renderShippingInfo() {
    const free = calcFreeDelivery(state.subscription.packs, PLAN_RULES.packsPerFreeDelivery);
    els.freeDeliveryCount.textContent = free;
}

/** Screen 1：模拟计算区 */
function renderSimulate() {
    const dailyPacks = parseFloat(els.dailyPacksInput.value) || 0;
    state.subscription.dailyPacks = dailyPacks;

    const days = state.subscription.days;
    const simPacks = calcSimulatedPacks(dailyPacks, days);
    state.subscription.simulatedPacks = simPacks;

    els.simulatedPacksValue.textContent = simPacks > 0 ? simPacks + ' 包' : '-- 包';
    els.adoptSimBtn.disabled = simPacks <= 0;
}

/** Screen 2：口味列表（含 [− X +] 控件） */
function renderFlavors() {
    const flavors = PRODUCT_DATA[state.subscription.petType].flavors;
    const totalPacks = state.subscription.packs;

    // 初始化分配（缺失的口味补 0）
    for (const f of flavors) {
        if (state.allocation[f.id] === undefined) state.allocation[f.id] = 0;
    }

    let html = '';
    for (const f of flavors) {
        const current = state.allocation[f.id] || 0;
        const upper = flavorUpperLimit(f.id, totalPacks, state.allocation);
        const minusDisabled = current <= 0 ? 'disabled' : '';
        const plusDisabled  = current >= upper ? 'disabled' : '';

        html += `
            <div class="flavor-item" data-flavor="${f.id}">
                <div class="flavor-name">
                    <span class="flavor-name-text">${f.name}</span>
                    <span class="flavor-price">¥${f.price}/包</span>
                </div>
                <div class="flavor-controls">
                    <button class="btn-minus" data-action="minus" data-flavor="${f.id}" ${minusDisabled}>−</button>
                    <input type="number" class="flavor-input" data-flavor="${f.id}"
                           value="${current}" min="0" max="${upper}" step="1" inputmode="numeric">
                    <button class="btn-plus" data-action="plus" data-flavor="${f.id}" ${plusDisabled}>+</button>
                </div>
            </div>`;
    }
    els.flavorList.innerHTML = html;
}

/** Screen 2：分配汇总 + 价格面板 */
function renderAllocate() {
    const flavors = PRODUCT_DATA[state.subscription.petType].flavors;
    const totalPacks = state.subscription.packs;
    const allocated = sumAllocation(state.allocation);

    els.totalCount.textContent = totalPacks;
    els.allocatedCount.textContent = allocated;

    const diff = totalPacks - allocated;
    if (diff === 0) {
        els.allocationHint.textContent = '';
    } else if (diff > 0) {
        els.allocationHint.textContent = '还剩 ' + diff + ' 包未分配';
    } else {
        els.allocationHint.textContent = '已超出 ' + (-diff) + ' 包，请调减';
    }

    els.btnNext2.disabled = diff !== 0;

    renderFlavors();
    renderPrice();
}

/** Screen 2：价格面板（原价 / 折后价 / 折扣率） */
function renderPrice() {
    const flavors = PRODUCT_DATA[state.subscription.petType].flavors;
    const totalPacks = state.subscription.packs;

    const originalPrice = calcOriginalPrice(state.allocation, flavors);
    const tier = getDiscountTier(totalPacks, PLAN_RULES.tiers);
    const rate = tier ? tier.rate : 1;
    const discountedPrice = originalPrice * rate;

    els.priceOriginal.textContent = fmtMoney(originalPrice);
    els.priceValue.textContent = fmtMoney(discountedPrice);

    if (tier && rate < 1) {
        els.priceRate.textContent = fmtDiscount(rate);
    } else {
        els.priceRate.textContent = '';
    }
}

/** Screen 2：热量偏差提示（仅回程路径触发） */
function renderCalorieDeviation() {
    // TODO: 暂时隐藏热量校准功能，待后续优化
    els.calorieDeviation.classList.add('hidden');
    return;

    if (!state.returnContext.fromPlan || !state.returnContext.targetKcal) {
        els.calorieDeviation.classList.add('hidden');
        return;
    }

    const days = state.subscription.days;
    if (!days || days <= 0) {
        els.calorieDeviation.classList.add('hidden');
        return;
    }

    const flavors = PRODUCT_DATA[state.subscription.petType].flavors;
    const totalKcal = calcTotalKcal(state.allocation, flavors);
    const dailyKcal = totalKcal / days;  // 日均摄入
    const targetKcal = state.returnContext.targetKcal;  // 每日推荐
    const diff = dailyKcal - targetKcal;
    const deviation = Math.abs(diff) / targetKcal;

    if (deviation <= PLAN_RULES.calorieDeviationThreshold) {
        els.calorieDeviation.classList.add('hidden');
        return;
    }

    const sign = diff > 0 ? '+' : '';
    els.deviationText.textContent =
        '日均摄入约 ' + Math.round(dailyKcal) + ' kcal，推荐 ' + Math.round(targetKcal) + ' kcal（偏差 ' +
        sign + (deviation * 100).toFixed(1) + '%）';
    els.calorieDeviation.classList.remove('hidden');
}

/** Screen 3：快照卡片数据填充 */
function renderSnapshot() {
    const flavors = PRODUCT_DATA[state.subscription.petType].flavors;
    const petLabel = state.subscription.petType === 'dog' ? '犬' : '猫';
    const totalPacks = state.subscription.packs;
    const tier = getDiscountTier(totalPacks, PLAN_RULES.tiers);
    const rate = tier ? tier.rate : 1;
    const originalPrice = calcOriginalPrice(state.allocation, flavors);
    const discountedPrice = originalPrice * rate;

    els.snapPet.textContent = petLabel;
    els.snapPacks.textContent = totalPacks + ' 包';
    if (tier) {
        els.snapDiscount.textContent = fmtDiscount(rate);
        els.snapDiscount.style.display = '';
    } else {
        els.snapDiscount.style.display = 'none';
    }

    // 口味分配
    let flavorHtml = '';
    for (const f of flavors) {
        const count = state.allocation[f.id] || 0;
        if (count > 0) {
            flavorHtml += `<div class="snapshot-field"><span>${f.name}</span><span>${count} 包</span></div>`;
        }
    }
    els.snapFlavorList.innerHTML = flavorHtml;

    els.snapOriginalPrice.textContent = fmtMoney(originalPrice);
    els.snapTotalPrice.textContent = fmtMoney(discountedPrice);

    // 生成日期
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    els.snapDate.textContent = y + '/' + m + '/' + d;
}

/* ========== 屏幕切换 ========== */

function showScreen(n) {
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    const target = document.getElementById('step-' + n);
    if (target) target.classList.add('active');

    switch (n) {
        case 1:
            renderPacks();
            renderSimulate();
            break;
        case 2:
            renderAllocate();
            renderCalorieDeviation();
            break;
        case 3:
            renderSnapshot();
            break;
    }
}

/* ========== 口味分配操作 ========== */

/** 均分 */
function doEvenSplit() {
    const flavors = PRODUCT_DATA[state.subscription.petType].flavors;
    state.allocation = calcEvenSplit(state.subscription.packs, flavors);
    renderAllocate();
    renderCalorieDeviation();
}

/** 清零 */
function doClearAll() {
    const flavors = PRODUCT_DATA[state.subscription.petType].flavors;
    for (const f of flavors) state.allocation[f.id] = 0;
    renderAllocate();
    renderCalorieDeviation();
}

/** 修改某口味包数（钳制到合法范围） */
function setFlavorPack(flavorId, value) {
    const totalPacks = state.subscription.packs;
    const upper = flavorUpperLimit(flavorId, totalPacks, state.allocation);
    const clamped = Math.max(0, Math.min(Math.round(value), upper));
    state.allocation[flavorId] = clamped;
    renderAllocate();
    renderCalorieDeviation();
}

/* ========== 天数选择 ========== */

function selectDayOption(btn, days) {
    els.dayOptions.querySelectorAll('.day-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    if (days === 0) {
        // 自定义
        els.customDaysInput.classList.remove('hidden');
        state.subscription.days = parseInt(els.customDaysInput.value) || 0;
    } else {
        els.customDaysInput.classList.add('hidden');
        els.customDaysInput.value = '';
        state.subscription.days = days;
    }
    renderSimulate();
}

/* ========== 模拟值采用 ========== */

function adoptSimulatedValue() {
    const simPacks = state.subscription.simulatedPacks;
    if (simPacks <= 0) return;

    els.packsInput.value = simPacks;
    state.subscription.packs = simPacks;
    renderPacks();
}

/* ========== 回程跳转 ========== */

function goToCalories() {
    const pet = state.subscription.petType;
    window.location.href = '../calories/?from=plan&pet=' + pet;
}

/* ========== 快照保存 ========== */

async function saveSnapshot() {
    // 先把隐藏卡片填上同样数据（html2canvas 需要真实渲染）
    els.snapshotCard.innerHTML = els.snapshotPreview.innerHTML;

    try {
        const canvas = await html2canvas(els.snapshotCard, {
            backgroundColor: null,
            useCORS: true,
            scale: 2
        });
        const dataUrl = canvas.toDataURL('image/png');
        els.imagePreviewImg.src = dataUrl;
        els.imagePreviewModal.classList.add('active');
    } catch (err) {
        console.error('快照生成失败:', err);
        showToast('快照生成失败，请重试');
    }
}

function closeImagePreview() {
    els.imagePreviewModal.classList.remove('active');
}

function showServiceQR() {
    els.imagePreviewImg.src = 'image/qrcode-service.png';
    els.imagePreviewModal.classList.add('active');
}

function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    setTimeout(() => els.toast.classList.remove('show'), 2000);
}

/* ========== 重新规划 ========== */

function restart() {
    state.subscription.packs = 0;
    state.subscription.dailyPacks = 0;
    state.subscription.days = 0;
    state.subscription.simulatedPacks = 0;
    state.allocation = {};
    state.delivery.times = 0;

    els.packsInput.value = '';
    els.dailyPacksInput.value = '';
    els.customDaysInput.value = '';
    els.customDaysInput.classList.add('hidden');
    els.dayOptions.querySelectorAll('.day-btn').forEach(b => b.classList.remove('selected'));
    els.simulatedPacksValue.textContent = '-- 包';
    els.adoptSimBtn.disabled = true;
    els.packsHint.classList.remove('show');

    showScreen(1);
}

/* ========== URL 参数解析（calories/ 回程） ========== */

function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const from = params.get('from');
    const pet  = params.get('pet');
    const packs = parseFloat(params.get('packs')) || 0;   // 每日包数（来自 calories/）
    const kcal  = parseFloat(params.get('kcal')) || 0;

    if (from === 'plan') {
        state.returnContext.fromPlan = true;
        state.returnContext.targetKcal = kcal;
        if (pet && PRODUCT_DATA[pet]) {
            state.subscription.petType = pet;
        }
        // packs 是每日包数（平均），填入模拟区输入框
        if (packs > 0) {
            els.dailyPacksInput.value = packs;
            state.subscription.dailyPacks = packs;
            // 默认选中 30 天作为锚点
            const defaultBtn = document.querySelector('.day-btn[data-days="30"]');
            if (defaultBtn) selectDayOption(defaultBtn, 30);
            // 展开模拟计算区，让用户看到结果
            document.getElementById('section-simulate')?.classList.remove('collapsed');
        }
    }
}

/* ========== 事件绑定 ========== */

function bindEvents() {
    // ---- Screen 1 ----

    // 模拟计算折叠
    const simulateToggle = document.getElementById('simulateToggle');
    const simulateSection = document.getElementById('section-simulate');

    simulateToggle.addEventListener('click', () => {
        simulateSection.classList.toggle('collapsed');
    });

    // 默认折叠（from=plan 回程时保持展开，已在 parseUrlParams 中移除 collapsed）
    if (!state.returnContext.fromPlan) {
        simulateSection.classList.add('collapsed');
    }

    // 宠物类型
    els.petOptions.addEventListener('click', (e) => {
        const card = e.target.closest('.pet-card');
        if (!card || card.classList.contains('disabled')) return;
        els.petOptions.querySelectorAll('.pet-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        state.subscription.petType = card.dataset.pet;
    });

    // 订阅包数（实时校验）
    els.packsInput.addEventListener('input', renderPacks);
    els.packsInput.addEventListener('change', renderPacks);

    // 每日包数（实时计算 D 值）
    els.dailyPacksInput.addEventListener('input', renderSimulate);
    els.dailyPacksInput.addEventListener('change', renderSimulate);

    // 天数快捷选项
    els.dayOptions.addEventListener('click', (e) => {
        const btn = e.target.closest('.day-btn');
        if (!btn) return;
        const days = parseInt(btn.dataset.days);
        selectDayOption(btn, days);
    });

    // 自定义天数
    els.customDaysInput.addEventListener('input', () => {
        state.subscription.days = parseInt(els.customDaysInput.value) || 0;
        renderSimulate();
    });
    els.customDaysInput.addEventListener('change', () => {
        state.subscription.days = parseInt(els.customDaysInput.value) || 0;
        renderSimulate();
    });

    // 先去算热量
    els.goCaloriesBtn.addEventListener('click', goToCalories);

    // 采用模拟值
    els.adoptSimBtn.addEventListener('click', adoptSimulatedValue);

    // 下一步 → Screen 2
    els.btnNext1.addEventListener('click', () => showScreen(2));

    // ---- Screen 2 ----

    // 返回 Screen 1
    els.btnBack2.addEventListener('click', () => showScreen(1));

    // 一键均分 / 清零
    els.btnEvenSplit.addEventListener('click', doEvenSplit);
    els.btnClearAll.addEventListener('click', doClearAll);

    // 口味分配 [− X +]（事件委托）
    els.flavorList.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const flavorId = btn.dataset.flavor;
        const current = state.allocation[flavorId] || 0;
        if (btn.dataset.action === 'minus') {
            setFlavorPack(flavorId, current - 1);
        } else if (btn.dataset.action === 'plus') {
            setFlavorPack(flavorId, current + 1);
        }
    });

    // 口味输入框直接编辑
    els.flavorList.addEventListener('change', (e) => {
        if (e.target.classList.contains('flavor-input')) {
            const flavorId = e.target.dataset.flavor;
            const val = parseInt(e.target.value) || 0;
            setFlavorPack(flavorId, val);
        }
    });

    // 下一步 → Screen 3
    els.btnNext2.addEventListener('click', () => showScreen(3));

    // ---- Screen 3 ----

    // 返回 Screen 2
    els.btnBack3.addEventListener('click', () => showScreen(2));

    // 联系企微客服
    els.btnContactService.addEventListener('click', showServiceQR);

    // 重新规划
    els.btnRestart.addEventListener('click', restart);

    // ---- 通用 ----

    // 关闭图片预览
    els.imagePreviewClose.addEventListener('click', closeImagePreview);
    els.imagePreviewModal.addEventListener('click', (e) => {
        if (e.target === els.imagePreviewModal) closeImagePreview();
    });
}

/* ========== 初始化 ========== */

function init() {
    cacheDom();
    parseUrlParams();
    bindEvents();

    // 默认日期
    const now = new Date();
    els.snapDate.textContent = now.getFullYear() + '/' +
        String(now.getMonth() + 1).padStart(2, '0') + '/' +
        String(now.getDate()).padStart(2, '0');

    // 初始渲染
    showScreen(1);
}

document.addEventListener('DOMContentLoaded', init);
