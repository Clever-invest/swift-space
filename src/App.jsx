import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import {
  TrendingUp, DollarSign, Calendar, AlertCircle, Download, Clock,
  Save, Trash2, MapPin, Home, Search
} from 'lucide-react';

// ==== Fallback-хранилище на localStorage, если window.storage отсутствует ====
if (!window.storage) {
  window.storage = {
    async set(key, value) { localStorage.setItem(key, value); return true; },
    async get(key) { const v = localStorage.getItem(key); return v ? { value: v } : null; },
    async list(prefix) {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
      return { keys };
    },
    async delete(key) { localStorage.removeItem(key); return true; },
  };
}

const FlipCalculator = () => {
  const [params, setParams] = useState({
    propertyName: '',
    location: '',
    propertyType: '1BR',
    purchasePrice: 500000,
    sellingPrice: 700000,
    dldFees: 4,
    buyerCommission: 2,
    sellerCommission: 4,
    renovationBudget: 100000,
    contingency: 15,
    renovationMonths: 3,
    listingMonths: 2,
    serviceChargeYearly: 6000,
    dewaAcMonthly: 500,
    trusteeOfficeFee: 5000, // учитываем ТОЛЬКО на покупке
    targetReturn: 25,       // годовой таргет (для early sale)
    profitSplit: 50,        // доля инвестора, %
    marketGrowth: 0,
  });

  const [savedProperties, setSavedProperties] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [editingWeek, setEditingWeek] = useState(null);
  const [customMetrics, setCustomMetrics] = useState({});
  const controllerRef = useRef(null);

  useEffect(() => {
    loadProperties();
    return () => {
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (params.location.length > 3) {
        searchLocation(params.location);
      } else {
        setLocationSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [params.location]);

  const searchLocation = async (query) => {
    if (query.length < 3) return;

    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();

    setSearchingLocation(true);
    try {
      const searchQuery = query.includes('Dubai') ? query : `${query}, Dubai, UAE`;
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('q', searchQuery);
      url.searchParams.set('format', 'json');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('limit', '10');
      url.searchParams.set('countrycodes', 'ae');
      url.searchParams.set('accept-language', 'ru');

      const response = await fetch(url.toString(), {
        headers: { 'Accept': 'application/json' },
        signal: controllerRef.current.signal,
        referrerPolicy: 'strict-origin-when-cross-origin'
      });

      if (response.ok) {
        const data = await response.json();
        setLocationSuggestions(data);
        setShowSuggestions(data.length > 0);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Location search error:', error);
        setLocationSuggestions([]);
      }
    } finally {
      setSearchingLocation(false);
    }
  };

  const selectLocation = (suggestion) => {
    const displayName = suggestion.display_name.split(',').slice(0, 3).join(',');
    setParams(prev => ({ ...prev, location: displayName }));
    setSelectedCoordinates({
      lat: parseFloat(suggestion.lat),
      lon: parseFloat(suggestion.lon)
    });
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  const loadProperties = async () => {
    try {
      const result = await window.storage.list('property:');
      if (result && result.keys) {
        const properties = await Promise.all(
          result.keys.map(async (key) => {
            try {
              const data = await window.storage.get(key);
              return data ? JSON.parse(data.value) : null;
            } catch {
              return null;
            }
          })
        );
        setSavedProperties(properties.filter(p => p !== null));
      }
    } catch (error) {
      console.log('No saved properties yet');
    }
  };

  const saveProperty = async () => {
    if (!params.propertyName.trim()) {
      alert('Пожалуйста, укажите название объекта');
      return;
    }
    const property = {
      ...params,
      coordinates: selectedCoordinates,
      calculations: calculations,
      savedAt: new Date().toISOString(),
      id: Date.now().toString()
    };
    try {
      const result = await window.storage.set(`property:${property.id}`, JSON.stringify(property));
      if (result) {
        await loadProperties();
        alert('✅ Объект успешно сохранен!');
      } else {
        alert('⚠️ Не удалось сохранить объект');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('❌ Ошибка сохранения: ' + error.message);
    }
  };

  const exportDealSheet = () => {
    const formatted = {
      propertyName: params.propertyName || 'Без названия',
      location: params.location || '',
      propertyType: params.propertyType,
      date: new Date().toLocaleString('ru-RU'),
      netProfit: formatCurrency(calculations.profit.net),
      roi: calculations.profit.roi.toFixed(1),
      irr: calculations.profit.irr.toFixed(1),
      totalMonths: calculations.totalMonths,
      purchasePrice: formatCurrency(params.purchasePrice),
      sellingPrice: formatCurrency(params.sellingPrice),
      dldPercent: params.dldFees,
      dldAmount: formatCurrency(calculations.costs.dld),
      buyerCommission: params.buyerCommission,
      buyerCommissionAmount: formatCurrency(calculations.costs.buyerCommission),
      buyerCommissionVAT: formatCurrency(calculations.costs.buyerCommissionVAT),
      sellerCommission: params.sellerCommission,
      sellerCommissionAmount: formatCurrency(calculations.revenue.sellerCommission),
      sellerCommissionVAT: formatCurrency(calculations.revenue.sellerCommissionVAT),
      renovationBudget: formatCurrency(params.renovationBudget),
      contingency: params.contingency,
      contingencyAmount: formatCurrency(calculations.costs.renovation - params.renovationBudget),
      serviceChargeYearly: formatCurrency(params.serviceChargeYearly),
      serviceCharge: formatCurrency(calculations.costs.serviceCharge),
      dewaAcMonthly: formatCurrency(params.dewaAcMonthly),
      dewaAc: formatCurrency(calculations.costs.dewaAc),
      trusteeOfficeFee: formatCurrency(params.trusteeOfficeFee),
      totalCosts: formatCurrency(calculations.costs.total),
      purchase: formatCurrency(calculations.costs.purchase),
      dld: formatCurrency(calculations.costs.dld),
      buyerComm: formatCurrency(calculations.costs.buyerCommission),
      renovation: formatCurrency(calculations.costs.renovation),
      trustee: formatCurrency(calculations.costs.trusteeOfficeFee),
      revenue: formatCurrency(calculations.revenue.net),
      investorCapital: formatCurrency(calculations.distribution.investorCapital),
      investorProfit: formatCurrency(calculations.distribution.investorProfit),
      investorTotal: formatCurrency(calculations.distribution.investorTotal),
      operatorProfit: formatCurrency(calculations.distribution.operatorProfit),
      operatorTotal: formatCurrency(calculations.distribution.operatorTotal),
      profitSplit: params.profitSplit,
      renovationMonths: params.renovationMonths,
      listingMonths: params.listingMonths,
      breakEven: formatCurrency(calculations.breakEven)
    };

    const profitColor = calculations.profit.net > 0 ? '#d1fae5' : '#fee2e2';
    const profitClass = calculations.profit.net > 0 ? 'positive' : 'negative';

    const mapHtml = selectedCoordinates ? `
      <div style="margin-top: 20px;">
        <h3 style="color: #1e40af; margin-bottom: 10px;">📍 Карта локации</h3>
        <div style="width: 100%; max-width: 600px; height: 300px; border: 2px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <iframe
            width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0"
            src="https://www.openstreetmap.org/export/embed.html?bbox=${selectedCoordinates.lon-0.01},${selectedCoordinates.lat-0.01},${selectedCoordinates.lon+0.01},${selectedCoordinates.lat+0.01}&layer=mapnik&marker=${selectedCoordinates.lat},${selectedCoordinates.lon}"
            style="border: 0;">
          </iframe>
        </div>
      </div>
    ` : '';

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('❌ Не удалось открыть окно печати. Разрешите всплывающие окна для этого сайта.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Лист сделки - ${formatted.propertyName}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; background: #f9fafb; color: #1f2937; }
          .container { max-width: 1000px; margin: 0 auto; background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 12px; margin-bottom: 20px; }
          h1 { color: #1e40af; font-size: 24px; margin-bottom: 8px; }
          .subtitle { color: #6b7280; font-size: 14px; }
          .section { margin-bottom: 20px; padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #3b82f6; }
          .section h2 { color: #1e40af; font-size: 18px; margin-bottom: 12px; }
          .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
          @media (max-width: 640px) { .info-grid { grid-template-columns: 1fr; } }
          .info-item { display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 6px; border: 1px solid #e5e7eb; }
          .info-label { color: #6b7280; font-weight: 500; }
          .info-value { font-weight: 700; color: #1f2937; }
          .metric-card { padding: 16px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; border-radius: 12px; text-align: center; }
          .metric-label { font-size: 12px; opacity: 0.9; margin-bottom: 4px; }
          .metric-value { font-size: 24px; font-weight: 700; }
          .distribution { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 16px; }
          @media (max-width: 640px) { .distribution { grid-template-columns: 1fr; } }
          .dist-card { padding: 16px; border-radius: 10px; border: 2px solid #e5e7eb; }
          .dist-investor { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; }
          .dist-operator { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; background: white; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #f3f4f6; color: #374151; font-weight: 600; }
          .positive { color: #10b981; font-weight: 600; }
          .negative { color: #ef4444; font-weight: 600; }
          .footer { margin-top: 24px; padding-top: 16px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
          @media print { body { padding: 16px; background: white; } .container { box-shadow: none; } @page { margin: 1cm; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Лист сделки флиппинга</h1>
            <div class="subtitle">${formatted.propertyName}</div>
            <div class="subtitle" style="margin-top: 5px;">
              ${formatted.location ? '📍 ' + formatted.location : ''} 
              ${formatted.propertyType ? '• ' + formatted.propertyType : ''}
            </div>
            <div class="subtitle" style="margin-top: 5px; font-size: 12px;">
              Создано: ${formatted.date}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px;">
            <div class="metric-card"><div class="metric-label">Чистая прибыль</div><div class="metric-value">${formatted.netProfit}</div></div>
            <div class="metric-card"><div class="metric-label">ROI</div><div class="metric-value">${formatted.roi}%</div></div>
            <div class="metric-card"><div class="metric-label">IRR</div><div class="metric-value">${formatted.irr}%</div></div>
            <div class="metric-card"><div class="metric-label">Срок</div><div class="metric-value">${formatted.totalMonths} мес</div></div>
          </div>

          <div class="section">
            <h2>💰 Финансовые параметры</h2>
            <div class="info-grid">
              <div class="info-item"><span class="info-label">Цена покупки</span><span class="info-value">${formatted.purchasePrice}</span></div>
              <div class="info-item"><span class="info-label">Цена продажи</span><span class="info-value">${formatted.sellingPrice}</span></div>
              <div class="info-item"><span class="info-label">DLD/регистрация (${formatted.dldPercent}%)</span><span class="info-value">${formatted.dldAmount}</span></div>
              <div class="info-item"><span class="info-label">Комиссия покупателя (${formatted.buyerCommission}%)</span><span class="info-value">${formatted.buyerCommissionAmount}</span></div>
              <div class="info-item"><span class="info-label">VAT на комиссию покупателя (5%)</span><span class="info-value">${formatted.buyerCommissionVAT}</span></div>
              <div class="info-item"><span class="info-label">Комиссия продавца (${formatted.sellerCommission}%)</span><span class="info-value">${formatted.sellerCommissionAmount}</span></div>
              <div class="info-item"><span class="info-label">VAT на комиссию продавца (5%)</span><span class="info-value">${formatted.sellerCommissionVAT}</span></div>
              <div class="info-item"><span class="info-label">Бюджет ремонта</span><span class="info-value">${formatted.renovationBudget}</span></div>
              <div class="info-item"><span class="info-label">Резерв (${formatted.contingency}%)</span><span class="info-value">${formatted.contingencyAmount}</span></div>
              <div class="info-item"><span class="info-label">Service Charge (год: ${formatted.serviceChargeYearly})</span><span class="info-value">${formatted.serviceCharge}</span></div>
              <div class="info-item"><span class="info-label">DEWA AC (мес: ${formatted.dewaAcMonthly})</span><span class="info-value">${formatted.dewaAc}</span></div>
              <div class="info-item"><span class="info-label">Trustee Office Fee</span><span class="info-value">${formatted.trusteeOfficeFee}</span></div>
            </div>
          </div>

          <div class="section">
            <h2>📈 Затраты и выручка</h2>
            <table>
              <tr><td><strong>Общие затраты</strong></td><td style="text-align: right;"><strong>${formatted.totalCosts}</strong></td></tr>
              <tr><td>Покупка</td><td style="text-align: right;">${formatted.purchase}</td></tr>
              <tr><td>DLD/регистрация</td><td style="text-align: right;">${formatted.dld}</td></tr>
              <tr><td>Комиссия покупателя</td><td style="text-align: right;">${formatted.buyerComm}</td></tr>
              <tr><td>VAT на комиссию покупателя</td><td style="text-align: right;">${formatted.buyerCommissionVAT}</td></tr>
              <tr><td>Ремонт</td><td style="text-align: right;">${formatted.renovation}</td></tr>
              <tr><td>Service Charge</td><td style="text-align: right;">${formatted.serviceCharge}</td></tr>
              <tr><td>DEWA AC</td><td style="text-align: right;">${formatted.dewaAc}</td></tr>
              <tr><td>Trustee Office Fee</td><td style="text-align: right;">${formatted.trustee}</td></tr>
              <tr style="border-top: 2px solid #3b82f6;">
                <td><strong>Чистая выручка</strong></td><td style="text-align: right;"><strong>${formatted.revenue}</strong></td>
              </tr>
              <tr style="background: ${profitColor};">
                <td><strong>Чистая прибыль</strong></td>
                <td style="text-align: right;" class="${profitClass}"><strong>${formatted.netProfit}</strong></td>
              </tr>
            </table>
          </div>

          <div class="section">
            <h2>🤝 Распределение прибыли (${formatted.profitSplit}/${100-formatted.profitSplit})</h2>
            <div class="distribution">
              <div class="dist-card dist-investor">
                <h3 style="margin-bottom: 12px; font-size: 16px;">Инвестор</h3>
                <div style="margin-bottom: 8px;"><div style="opacity: 0.9; font-size: 14px;">Возврат капитала</div><div style="font-size: 18px; font-weight: 700;">${formatted.investorCapital}</div></div>
                <div style="margin-bottom: 8px;"><div style="opacity: 0.9; font-size: 14px;">Доля прибыли</div><div style="font-size: 18px; font-weight: 700;">${formatted.investorProfit}</div></div>
                <div style="border-top: 2px solid rgba(255,255,255,0.3); padding-top: 8px; margin-top: 8px;"><div style="opacity: 0.9; font-size: 14px;">Итого</div><div style="font-size: 20px; font-weight: 700;">${formatted.investorTotal}</div></div>
              </div>
              <div class="dist-card dist-operator">
                <h3 style="margin-bottom: 12px; font-size: 16px;">Оператор</h3>
                <div style="margin-bottom: 8px;"><div style="opacity: 0.9; font-size: 14px;">Капитал</div><div style="font-size: 18px; font-weight: 700;">—</div></div>
                <div style="margin-bottom: 8px;"><div style="opacity: 0.9; font-size: 14px;">Доля прибыли</div><div style="font-size: 18px; font-weight: 700;">${formatted.operatorProfit}</div></div>
                <div style="border-top: 2px solid rgba(255,255,255,0.3); padding-top: 8px; margin-top: 8px;"><div style="opacity: 0.9; font-size: 14px;">Итого</div><div style="font-size: 20px; font-weight: 700;">${formatted.operatorTotal}</div></div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>⏱️ График сделки</h2>
            <div class="info-grid">
              <div class="info-item"><span class="info-label">Срок ремонта</span><span class="info-value">${formatted.renovationMonths} месяцев</span></div>
              <div class="info-item"><span class="info-label">Срок экспозиции</span><span class="info-value">${formatted.listingMonths} месяцев</span></div>
              <div class="info-item"><span class="info-label">Общий срок</span><span class="info-value">${formatted.totalMonths} месяцев</span></div>
              <div class="info-item"><span class="info-label">Точка безубыточности</span><span class="info-value">${formatted.breakEven}</span></div>
            </div>
          </div>

          ${mapHtml}

          <div class="footer">
            <p><strong>Калькулятор флиппинга недвижимости</strong></p>
            <p>Этот документ создан автоматически и предназначен только для информационных целей</p>
          </div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      try { printWindow.print(); }
      catch { alert('Документ открыт в новом окне. Используйте Ctrl+P или Cmd+P для печати.'); }
    }, 400);
  };

  const loadProperty = (property) => {
    setParams({
      propertyName: property.propertyName,
      location: property.location,
      propertyType: property.propertyType,
      purchasePrice: property.purchasePrice,
      sellingPrice: property.sellingPrice,
      dldFees: property.dldFees,
      buyerCommission: property.buyerCommission,
      sellerCommission: property.sellerCommission,
      renovationBudget: property.renovationBudget,
      contingency: property.contingency,
      renovationMonths: property.renovationMonths,
      listingMonths: property.listingMonths,
      serviceChargeYearly: property.serviceChargeYearly ?? 6000,
      dewaAcMonthly: property.dewaAcMonthly ?? 500,
      trusteeOfficeFee: property.trusteeOfficeFee ?? 5000,
      targetReturn: property.targetReturn,
      profitSplit: property.profitSplit,
      marketGrowth: property.marketGrowth
    });

    if (property.coordinates) {
      setSelectedCoordinates(property.coordinates);
    }
    setCustomMetrics({});
  };

  const deleteProperty = async (id) => {
    if (!confirm('Удалить этот объект?')) return;
    try {
      await window.storage.delete(`property:${id}`);
      await loadProperties();
    } catch (error) {
      alert('Ошибка удаления: ' + error.message);
    }
  };

  const calculations = useMemo(() => {
    const {
      purchasePrice, sellingPrice, dldFees, buyerCommission, sellerCommission,
      renovationBudget, contingency, renovationMonths, listingMonths,
      serviceChargeYearly, dewaAcMonthly, trusteeOfficeFee, profitSplit
    } = params;

    // Покупка
    const dldAmount = purchasePrice * (dldFees / 100);
    const buyerCommissionAmount = purchasePrice * (buyerCommission / 100);
    const buyerCommissionVAT = buyerCommissionAmount * 0.05;
    const buyerCommissionTotal = buyerCommissionAmount + buyerCommissionVAT;

    const contingencyAmount = renovationBudget * (contingency / 100);
    const totalRenovation = renovationBudget + contingencyAmount;

    const totalMonths = renovationMonths + listingMonths;
    const serviceChargeMonthly = serviceChargeYearly / 12;
    const carryingService = serviceChargeMonthly * totalMonths;
    const carryingDewa = dewaAcMonthly * totalMonths;

    // Trustee учитываем ТОЛЬКО на покупке
    const buyClosingFees = trusteeOfficeFee;

    const totalCosts =
      purchasePrice +
      dldAmount +
      buyerCommissionTotal +
      totalRenovation +
      carryingService +
      carryingDewa +
      buyClosingFees;

    // Продажа
    const sellerCommissionAmount = sellingPrice * (sellerCommission / 100);
    const sellerCommissionVAT = sellerCommissionAmount * 0.05;
    const sellerCommissionTotal = sellerCommissionAmount + sellerCommissionVAT;

    // Чистая выручка без trustee на продаже
    const revenueNet = sellingPrice - sellerCommissionTotal;

    // Прибыль и метрики
    const netProfit = revenueNet - totalCosts;
    const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;
    const irr =
      totalMonths > 0 && totalCosts > 0 && revenueNet > 0
        ? (Math.pow(revenueNet / totalCosts, 12 / totalMonths) - 1) * 100
        : 0;

    // Распределение прибыли — только положительная часть
    const remainingProfit = Math.max(0, netProfit);
    const investorCapitalReturn = totalCosts;
    const investorProfitShare = remainingProfit * (profitSplit / 100);
    const operatorProfitShare = remainingProfit - investorProfitShare;

    // Break-even: цена при revenueNet(price) = totalCosts
    const breakEvenPrice = totalCosts / (1 - (sellerCommission / 100) * 1.05);

    return {
      costs: {
        purchase: purchasePrice,
        dld: dldAmount,
        buyerCommission: buyerCommissionAmount,
        buyerCommissionVAT: buyerCommissionVAT,
        buyerCommissionTotal: buyerCommissionTotal,
        renovation: totalRenovation,
        serviceCharge: carryingService,
        dewaAc: carryingDewa,
        trusteeOfficeFee: buyClosingFees,
        total: totalCosts
      },
      revenue: {
        sellingPrice: sellingPrice,
        sellerCommission: sellerCommissionAmount,
        sellerCommissionVAT: sellerCommissionVAT,
        sellerCommissionTotal: sellerCommissionTotal,
        net: revenueNet
      },
      profit: { net: netProfit, roi, irr },
      distribution: {
        investorCapital: investorCapitalReturn,
        investorProfit: investorProfitShare,
        investorTotal: investorCapitalReturn + investorProfitShare,
        operatorProfit: operatorProfitShare,
        operatorTotal: operatorProfitShare
      },
      breakEven: breakEvenPrice,
      totalMonths
    };
  }, [params]);
  const waterfallData = useMemo(() => ([
    { name: 'Цена продажи', value: calculations.revenue.sellingPrice, fill: '#10b981' },
    { name: 'Комиссия продавца', value: -calculations.revenue.sellerCommission, fill: '#ef4444' },
    { name: 'VAT (5%)', value: -calculations.revenue.sellerCommissionVAT, fill: '#ef4444' },
    { name: 'Покупка', value: -calculations.costs.purchase, fill: '#f59e0b' },
    { name: 'DLD/рег.', value: -calculations.costs.dld, fill: '#f59e0b' },
    { name: 'Комиссия покупателя', value: -calculations.costs.buyerCommission, fill: '#f59e0b' },
    { name: 'VAT (5%)', value: -calculations.costs.buyerCommissionVAT, fill: '#f59e0b' },
    { name: 'Ремонт', value: -calculations.costs.renovation, fill: '#f59e0b' },
    { name: 'Service Charge', value: -calculations.costs.serviceCharge, fill: '#f59e0b' },
    { name: 'DEWA AC', value: -calculations.costs.dewaAc, fill: '#f59e0b' },
    { name: 'Trustee Office (покупка)', value: -calculations.costs.trusteeOfficeFee, fill: '#f59e0b' },
    { name: 'Чистая прибыль', value: calculations.profit.net, fill: calculations.profit.net > 0 ? '#10b981' : '#ef4444' }
  ]), [calculations]);

  const sensitivityData = useMemo(() => {
    const basePrice = params.sellingPrice;
    const baseReno = params.renovationBudget;
    const variations = [-10, -5, 0, 5, 10];

    return variations.map(pct => {
      const priceVar = basePrice * (1 + pct / 100);
      const renoVar = baseReno * (1 + pct / 100);

      const sellerCommAmt = priceVar * (params.sellerCommission / 100);
      const sellerCommVAT = sellerCommAmt * 0.05;
      const sellerCommTotal = sellerCommAmt + sellerCommVAT;
      const revenue1 = priceVar - sellerCommTotal; // без trustee на продаже
      const profit1 = revenue1 - calculations.costs.total;

      const contingencyVar = renoVar * (params.contingency / 100);
      const totalRenoVar = renoVar + contingencyVar;
      const costsVar = calculations.costs.total - calculations.costs.renovation + totalRenoVar;
      const profit2 = calculations.revenue.net - costsVar;

      return {
        variation: `${pct > 0 ? '+' : ''}${pct}%`,
        priceChange: profit1,
        renoChange: profit2
      };
    });
  }, [calculations, params]);
  const earlyDiscountData = useMemo(() => {
    const basePrice = params.sellingPrice;
    const listingWeeks = params.listingMonths * 4.33;
    const renovationWeeks = params.renovationMonths * 4.33;
    const dailyRate = params.targetReturn / 36500;

    const weeks = [];
    for (let week = 0; week <= listingWeeks; week += 2) {
      const totalWeeksFromStart = renovationWeeks + week;
      const totalMonthsFromStart = totalWeeksFromStart / 4.33;

      let recommendedPrice, roi, irr;

      if (customMetrics[week]) {
        const custom = customMetrics[week];

        if (custom.type === 'roi') {
          const targetROI = parseFloat(custom.value) / 100;
          const targetRevenueNet = (targetROI + 1) * calculations.costs.total; // revenueNet
          recommendedPrice = targetRevenueNet / (1 - (params.sellerCommission / 100) * 1.05);
          roi = custom.value;

          const sellerComm = recommendedPrice * (params.sellerCommission / 100);
          const sellerVAT = sellerComm * 0.05;
          const actualRevenueNet = recommendedPrice - sellerComm - sellerVAT;
          irr = totalMonthsFromStart > 0
            ? (Math.pow(actualRevenueNet / calculations.costs.total, 12 / totalMonthsFromStart) - 1) * 100
            : 0;

        } else if (custom.type === 'irr') {
          const targetIRR = parseFloat(custom.value) / 100;
          const targetRevenueNet = calculations.costs.total * Math.pow(targetIRR + 1, totalMonthsFromStart / 12);
          recommendedPrice = targetRevenueNet / (1 - (params.sellerCommission / 100) * 1.05);
          irr = custom.value;

          const newProfit = targetRevenueNet - calculations.costs.total;
          roi = (newProfit / calculations.costs.total) * 100;
        }
      } else {
        const daysEarly = (listingWeeks - week) * 7;
        const discount = basePrice * dailyRate * daysEarly;
        recommendedPrice = Math.max(0, basePrice - discount);

        const sellerComm = recommendedPrice * (params.sellerCommission / 100);
        const sellerVAT = sellerComm * 0.05;
        const newRevenueNet = recommendedPrice - sellerComm - sellerVAT;
        const newProfit = newRevenueNet - calculations.costs.total;

        irr = totalMonthsFromStart > 0
          ? (Math.pow(newRevenueNet / calculations.costs.total, 12 / totalMonthsFromStart) - 1) * 100
          : 0;
        roi = (newProfit / calculations.costs.total) * 100;
      }

      const sellerComm = recommendedPrice * (params.sellerCommission / 100);
      const sellerVAT = sellerComm * 0.05;
      const newRevenueNet = recommendedPrice - sellerComm - sellerVAT;
      const newProfit = newRevenueNet - calculations.costs.total;
      const discount = basePrice - recommendedPrice;

      weeks.push({
        week: Math.round(week),
        weekLabel: `Неделя ${Math.round(week)} (месяц ${(totalMonthsFromStart).toFixed(1)})`,
        discount: Math.round(discount),
        price: Math.round(recommendedPrice),
        profit: Math.round(newProfit),
        roi: typeof roi === 'number' ? roi.toFixed(1) : roi,
        irr: typeof irr === 'number' ? irr.toFixed(1) : irr,
        totalMonths: totalMonthsFromStart.toFixed(1)
      });
    }
    return weeks;
  }, [calculations, params, customMetrics]);

  const handleMetricEdit = (week, type, value) => {
    setCustomMetrics(prev => ({ ...prev, [week]: { type, value } }));
  };

  const clearCustomMetric = (week) => {
    setCustomMetrics(prev => {
      const next = { ...prev };
      delete next[week];
      return next;
    });
  };
  const fixMinusZero = (n) => (Object.is(n, -0) ? 0 : n);
  const formatCurrency = (value) => {
    const v = Math.abs(value) < 0.5 ? 0 : value;
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency', currency: 'AED', minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(fixMinusZero(v));
  };

  const handleParamChange = (key, value) => {
    if (['propertyName', 'location', 'propertyType'].includes(key)) {
      setParams(prev => ({ ...prev, [key]: value }));
      return;
    }
    const num = value === '' ? 0 : parseFloat(value);
    setParams(prev => ({ ...prev, [key]: isNaN(num) ? 0 : num }));
  };

  const propertyTypes = ['Studio', '1BR', '2BR', '3BR', '4BR', '5BR', 'Penthouse', 'Villa', 'Townhouse'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Калькулятор флиппинга недвижимости</h1>
            <p className="text-blue-100 text-sm sm:text-base">Интерактивный анализ сделки с мгновенным расчетом маржи и распределения долей</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 p-3 sm:p-6">
            {/* Левая колонка (ввод) */}
            <div className="md:col-span-1 space-y-4 md:max-h-[800px] md:overflow-y-auto">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Информация об объекте</h2>

                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Название объекта</label>
                    <input
                      type="text"
                      value={params.propertyName}
                      onChange={(e) => handleParamChange('propertyName', e.target.value)}
                      placeholder="Marina Bay Tower 3, Apt 2501"
                      className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      aria-label="Название объекта"
                    />
                  </div>

                  <div className="relative">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Локация</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={params.location}
                        onChange={(e) => {
                          handleParamChange('location', e.target.value);
                          setSelectedCoordinates(null); // сбросить старую метку при изменении ввода
                          setShowSuggestions(false);
                        }}
                        onFocus={() => {
                          if (params.location.length > 2 && locationSuggestions.length > 0) {
                            setShowSuggestions(true);
                          }
                        }}
                        placeholder="Начните вводить адрес в Дубае..."
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label="Локация"
                      />
                      {searchingLocation && (
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-pulse" />
                      )}
                    </div>

                    {showSuggestions && locationSuggestions.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                        {locationSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => selectLocation(suggestion)}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {suggestion.display_name.split(',')[0]}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {suggestion.display_name.split(',').slice(1, 4).join(',')}
                                </p>
                                {suggestion.type && (
                                  <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                    {suggestion.type}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {locationSuggestions.length === 0 && params.location.length > 3 && !searchingLocation && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-700">
                          Ничего не найдено. Попробуйте другой запрос.
                        </p>
                      </div>
                    )}

                    {selectedCoordinates && (
                      <div className="mt-3">
                        <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                          <iframe
                            width="100%" height="200" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedCoordinates.lon-0.01},${selectedCoordinates.lat-0.01},${selectedCoordinates.lon+0.01},${selectedCoordinates.lat+0.01}&layer=mapnik&marker=${selectedCoordinates.lat},${selectedCoordinates.lon}`}
                            style={{ border: 0 }}
                            title="Карта локации"
                          />
                          <div className="bg-white px-3 py-2 border-t border-gray-200">
                            <a
                              href={`https://www.openstreetmap.org/?mlat=${selectedCoordinates.lat}&mlon=${selectedCoordinates.lon}#map=16/${selectedCoordinates.lat}/${selectedCoordinates.lon}`}
                              target="_blank" rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              <MapPin className="w-3 h-3" />
                              Открыть в полном размере
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Тип объекта</label>
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <select
                        value={params.propertyType}
                        onChange={(e) => handleParamChange('propertyType', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                        aria-label="Тип объекта"
                      >
                        {propertyTypes.map(type => (<option key={type} value={type}>{type}</option>))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Параметры сделки</h2>

                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
                      Цена покупки: {formatCurrency(params.purchasePrice)}
                    </label>
                    <input
                      type="range" min="100000" max="10000000" step="10000"
                      value={params.purchasePrice}
                      onChange={(e) => handleParamChange('purchasePrice', e.target.value)}
                      className="w-full h-3"
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
                      Предполагаемая цена продажи: {formatCurrency(params.sellingPrice)}
                    </label>
                    <input
                      type="range" min={params.purchasePrice} max="12000000" step="10000"
                      value={params.sellingPrice}
                      onChange={(e) => handleParamChange('sellingPrice', e.target.value)}
                      className="w-full h-3"
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
                      DLD/регистрация: {params.dldFees}%
                    </label>
                    <input
                      type="range" min="0" max="5" step="0.1"
                      value={params.dldFees}
                      onChange={(e) => handleParamChange('dldFees', e.target.value)}
                      className="w-full h-3"
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
                      Комиссия брокера при покупке: {params.buyerCommission}%
                    </label>
                    <input
                      type="range" min="0" max="5" step="0.1"
                      value={params.buyerCommission}
                      onChange={(e) => handleParamChange('buyerCommission', e.target.value)}
                      className="w-full h-3"
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
                      Комиссия брокера при продаже: {params.sellerCommission}%
                    </label>
                    <input
                      type="range" min="0" max="5" step="0.1"
                      value={params.sellerCommission}
                      onChange={(e) => handleParamChange('sellerCommission', e.target.value)}
                      className="w-full h-3"
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
                      Бюджет ремонта: {formatCurrency(params.renovationBudget)}
                    </label>
                    <input
                      type="range" min="0" max="500000" step="5000"
                      value={params.renovationBudget}
                      onChange={(e) => handleParamChange('renovationBudget', e.target.value)}
                      className="w-full h-3"
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
                      Резерв: {params.contingency}%
                    </label>
                    <input
                      type="range" min="5" max="25" step="1"
                      value={params.contingency}
                      onChange={(e) => handleParamChange('contingency', e.target.value)}
                      className="w-full h-3"
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
                      Срок ремонта: {params.renovationMonths} мес
                    </label>
                    <input
                      type="range" min="1" max="12" step="1"
                      value={params.renovationMonths}
                      onChange={(e) => handleParamChange('renovationMonths', e.target.value)}
                      className="w-full h-3"
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
                      Срок экспозиции: {params.listingMonths} мес
                    </label>
                    <input
                      type="range" min="1" max="12" step="1"
                      value={params.listingMonths}
                      onChange={(e) => handleParamChange('listingMonths', e.target.value)}
                      className="w-full h-3"
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
                      Service Charge (год): {formatCurrency(params.serviceChargeYearly)}
                    </label>
                    <input
                      type="number"
                      value={params.serviceChargeYearly}
                      onChange={(e) => handleParamChange('serviceChargeYearly', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="6000"
                      inputMode="numeric"
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
                      DEWA AC (месяц): {formatCurrency(params.dewaAcMonthly)}
                    </label>
                    <input
                      type="number"
                      value={params.dewaAcMonthly}
                      onChange={(e) => handleParamChange('dewaAcMonthly', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="500"
                      inputMode="numeric"
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
                      Trustee Office Fee: {formatCurrency(params.trusteeOfficeFee)}
                    </label>
                    <input
                      type="number"
                      value={params.trusteeOfficeFee}
                      onChange={(e) => handleParamChange('trusteeOfficeFee', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="5000"
                      inputMode="numeric"
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
                      Доля инвестора: {params.profitSplit}%
                    </label>
                    <input
                      type="range" min="30" max="70" step="5"
                      value={params.profitSplit}
                      onChange={(e) => handleParamChange('profitSplit', e.target.value)}
                      className="w-full h-3"
                    />
                  </div>
                </div>

                <button
                  onClick={saveProperty}
                  className="w-full mt-3 sm:mt-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  Сохранить объект
                </button>
              </div>
            </div>
            {/* Правая область (результаты/графики/вкладки) */}
            <div className="md:col-span-2 space-y-4 sm:space-y-6">
              {(params.propertyName || params.location) && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 sm:p-4 border border-indigo-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-800">
                        {params.propertyName || 'Без названия'}
                      </h3>
                      <div className="flex items-center gap-3 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-600">
                        {params.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {params.location.split(',')[0]}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Home className="w-4 h-4" />
                          {params.propertyType}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Метрики верхнего уровня */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 sm:p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-xs sm:text-sm font-medium text-gray-600">Чистая прибыль</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {formatCurrency(calculations.profit.net)}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="text-xs sm:text-sm font-medium text-gray-600">ROI</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">
                    {calculations.profit.roi.toFixed(1)}%
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 sm:p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span className="text-xs sm:text-sm font-medium text-gray-600">IRR</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">
                    {calculations.profit.irr.toFixed(1)}%
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 sm:p-4 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <span className="text-xs sm:text-sm font-medium text-gray-600">Срок</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-orange-600">
                    {calculations.totalMonths} мес
                  </div>
                </div>
              </div>

              {/* Доли */}
              <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-4 text-white">
                  <h3 className="text-base sm:text-lg font-bold mb-3">Доля инвестора</h3>
                  <div className="space-y-2 text-sm sm:text-base">
                    <div className="flex justify-between">
                      <span className="text-blue-100">Возврат капитала:</span>
                      <span className="font-bold">{formatCurrency(calculations.distribution.investorCapital)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-100">Доля прибыли:</span>
                      <span className="font-bold">{formatCurrency(calculations.distribution.investorProfit)}</span>
                    </div>
                    <div className="border-t border-blue-400 pt-2 mt-2 flex justify-between">
                      <span className="font-bold">Итого:</span>
                      <span className="font-bold text-lg sm:text-xl">{formatCurrency(calculations.distribution.investorTotal)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-4 text-white">
                  <h3 className="text-base sm:text-lg font-bold mb-3">Доля оператора</h3>
                  <div className="space-y-2 text-sm sm:text-base">
                    <div className="flex justify-between">
                      <span className="text-purple-100">Капитал:</span>
                      <span className="font-bold">—</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-100">Доля прибыли:</span>
                      <span className="font-bold">{formatCurrency(calculations.distribution.operatorProfit)}</span>
                    </div>
                    <div className="border-t border-purple-400 pt-2 mt-2 flex justify-between">
                      <span className="font-bold">Итого:</span>
                      <span className="font-bold text-lg sm:text-xl">{formatCurrency(calculations.distribution.operatorTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Вкладки */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="flex border-b border-gray-200 overflow-x-auto sticky top-0 z-10 bg-white">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${
                      activeTab === 'overview'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Водопад
                  </button>
                  <button
                    onClick={() => setActiveTab('formula')}
                    className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${
                      activeTab === 'formula'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Детальный расчет
                  </button>
                  <button
                    onClick={() => setActiveTab('sensitivity')}
                    className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${
                      activeTab === 'sensitivity'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Сенситивность
                  </button>
                  <button
                    onClick={() => setActiveTab('early')}
                    className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${
                      activeTab === 'early'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Ранняя продажа
                  </button>
                  <button
                    onClick={() => setActiveTab('saved')}
                    className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${
                      activeTab === 'saved'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Сохраненные ({savedProperties.length})
                  </button>
                </div>

                <div className="p-3 sm:p-6">
                  {/* Водопад */}
                  {activeTab === 'overview' && (
                    <div>
                      <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Водопад: от цены продажи к чистой прибыли</h3>
                      <div className="h-64 md:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={waterfallData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-30} tick={{ fontSize: 10 }} height={60} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Bar dataKey="value">
                              {waterfallData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="text-sm sm:text-base font-medium text-yellow-800">Точка безубыточности</p>
                            <p className="text-xs sm:text-sm text-yellow-700 mt-1">
                              Минимальная цена продажи: <span className="font-bold">{formatCurrency(calculations.breakEven)}</span><br />
                              Формула: <span className="font-mono">Затраты ÷ (1 − Комиссия продавца% × 1.05)</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Детальный расчет */}
                  {activeTab === 'formula' && (
                    <div>
                      <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">📐 Детальный расчет с формулами</h3>

                      <div className="space-y-4 sm:space-y-6 text-xs sm:text-sm">
                        {/* Расходы */}
                        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg sm:rounded-xl p-3 sm:p-5 border-2 border-orange-200">
                          <h4 className="text-sm sm:text-lg font-bold text-orange-800 mb-3 sm:mb-4 flex items-center gap-2">
                            💰 Шаг 1: Расчет общих затрат
                          </h4>

                          <div className="space-y-2 sm:space-y-3 font-mono">
                            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                              <span className="text-gray-700">Цена покупки</span>
                              <span className="font-bold text-gray-900">{formatCurrency(params.purchasePrice)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                              <span className="text-gray-700">+ DLD/регистрация ({params.dldFees}%)</span>
                              <span className="font-bold text-orange-600">
                                + {formatCurrency(calculations.costs.dld)}
                                <span className="text-[10px] text-gray-500 ml-2">({formatCurrency(params.purchasePrice)} × {params.dldFees}%)</span>
                              </span>
                            </div>
                            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                              <span className="text-gray-700">+ Комиссия брокера при покупке ({params.buyerCommission}%)</span>
                              <span className="font-bold text-orange-600">
                                + {formatCurrency(calculations.costs.buyerCommission)}
                                <span className="text-[10px] text-gray-500 ml-2">({formatCurrency(params.purchasePrice)} × {params.buyerCommission}%)</span>
                              </span>
                            </div>
                            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                              <span className="text-gray-700">+ VAT на комиссию (5%)</span>
                              <span className="font-bold text-orange-600">
                                + {formatCurrency(calculations.costs.buyerCommissionVAT)}
                                <span className="text-[10px] text-gray-500 ml-2">({formatCurrency(calculations.costs.buyerCommission)} × 5%)</span>
                              </span>
                            </div>
                            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                              <span className="text-gray-700">+ Бюджет ремонта</span>
                              <span className="font-bold text-orange-600">+ {formatCurrency(params.renovationBudget)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                              <span className="text-gray-700">+ Резерв ({params.contingency}%)</span>
                              <span className="font-bold text-orange-600">
                                + {formatCurrency(calculations.costs.renovation - params.renovationBudget)}
                                <span className="text-[10px] text-gray-500 ml-2">({formatCurrency(params.renovationBudget)} × {params.contingency}%)</span>
                              </span>
                            </div>
                            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                              <span className="text-gray-700">+ Service Charge</span>
                              <span className="font-bold text-orange-600">
                                + {formatCurrency(calculations.costs.serviceCharge)}
                                <span className="text-[10px] text-gray-500 ml-2">({formatCurrency(params.serviceChargeYearly)}/12 × {calculations.totalMonths} мес)</span>
                              </span>
                            </div>
                            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                              <span className="text-gray-700">+ DEWA AC</span>
                              <span className="font-bold text-orange-600">
                                + {formatCurrency(calculations.costs.dewaAc)}
                                <span className="text-[10px] text-gray-500 ml-2">({formatCurrency(params.dewaAcMonthly)} × {calculations.totalMonths} мес)</span>
                              </span>
                            </div>
                            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                              <span className="text-gray-700">+ Trustee Office Fee (покупка)</span>
                              <span className="font-bold text-orange-600">+ {formatCurrency(params.trusteeOfficeFee)}</span>
                            </div>

                            <div className="border-t-4 border-orange-400 pt-3 mt-3">
                              <div className="flex justify-between items-center bg-orange-100 p-4 rounded-lg">
                                <span className="font-bold text-lg text-orange-900">= ОБЩИЕ ЗАТРАТЫ</span>
                                <span className="font-bold text-2xl text-orange-900">{formatCurrency(calculations.costs.total)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Выручка */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200">
                          <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                            💵 Шаг 2: Расчет чистой выручки
                          </h4>

                          <div className="space-y-3 font-mono">
                            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                              <span className="text-gray-700">Цена продажи</span>
                              <span className="font-bold text-gray-900">{formatCurrency(params.sellingPrice)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                              <span className="text-gray-700">- Комиссия брокера при продаже ({params.sellerCommission}%)</span>
                              <span className="font-bold text-red-600">
                                - {formatCurrency(calculations.revenue.sellerCommission)}
                                <span className="text-[10px] text-gray-500 ml-2">({formatCurrency(params.sellingPrice)} × {params.sellerCommission}%)</span>
                              </span>
                            </div>
                            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                              <span className="text-gray-700">- VAT на комиссию (5%)</span>
                              <span className="font-bold text-red-600">
                                - {formatCurrency(calculations.revenue.sellerCommissionVAT)}
                                <span className="text-[10px] text-gray-500 ml-2">({formatCurrency(calculations.revenue.sellerCommission)} × 5%)</span>
                              </span>
                            </div>

                            <div className="border-t-4 border-blue-400 pt-3 mt-3">
                              <div className="flex justify-between items-center bg-blue-100 p-4 rounded-lg">
                                <span className="font-bold text-lg text-blue-900">= ЧИСТАЯ ВЫРУЧКА</span>
                                <span className="font-bold text-2xl text-blue-900">{formatCurrency(calculations.revenue.net)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Прибыль */}
                        <div className={`bg-gradient-to-br ${calculations.profit.net >= 0 ? 'from-green-50 to-emerald-50 border-green-200' : 'from-red-50 to-rose-50 border-red-200'} rounded-xl p-5 border-2`}>
                          <h4 className={`text-lg font-bold ${calculations.profit.net >= 0 ? 'text-green-800' : 'text-red-800'} mb-4 flex items-center gap-2`}>
                            {calculations.profit.net >= 0 ? '✅' : '⚠️'} Шаг 3: Чистая прибыль
                          </h4>

                          <div className="space-y-3 font-mono">
                            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                              <span className="text-gray-700">Чистая выручка</span>
                              <span className="font-bold text-gray-900">{formatCurrency(calculations.revenue.net)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                              <span className="text-gray-700">- Общие затраты</span>
                              <span className="font-bold text-red-600">- {formatCurrency(calculations.costs.total)}</span>
                            </div>
                            <div className={`border-t-4 ${calculations.profit.net >= 0 ? 'border-green-400' : 'border-red-400'} pt-3 mt-3`}>
                              <div className={`flex justify-between items-center ${calculations.profit.net >= 0 ? 'bg-green-100' : 'bg-red-100'} p-4 rounded-lg`}>
                                <span className={`font-bold text-lg ${calculations.profit.net >= 0 ? 'text-green-900' : 'text-red-900'}`}>= ЧИСТАЯ ПРИБЫЛЬ</span>
                                <span className={`font-bold text-2xl ${calculations.profit.net >= 0 ? 'text-green-900' : 'text-red-900'}`}>{formatCurrency(calculations.profit.net)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Метрики доходности */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200">
                          <h4 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">📊 Шаг 4: Метрики доходности</h4>
                          <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border border-purple-200">
                              <div className="font-bold text-purple-900 mb-2">ROI (Return on Investment):</div>
                              <div className="font-mono space-y-1">
                                <div className="text-gray-700">ROI = (Чистая прибыль ÷ Общие затраты) × 100%</div>
                                <div className="text-purple-700">ROI = ({formatCurrency(calculations.profit.net)} ÷ {formatCurrency(calculations.costs.total)}) × 100%</div>
                                <div className="font-bold text-xl text-purple-900 mt-2">= {calculations.profit.roi.toFixed(2)}%</div>
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-purple-200">
                              <div className="font-bold text-purple-900 mb-2">IRR (Internal Rate of Return) — годовая доходность:</div>
                              <div className="font-mono space-y-1">
                                <div className="text-gray-700">IRR = ((Чистая выручка ÷ Общие затраты)^(12/месяцы) - 1) × 100%</div>
                                <div className="text-purple-700">
                                  IRR = (({formatCurrency(calculations.revenue.net)} ÷ {formatCurrency(calculations.costs.total)})^(12/{calculations.totalMonths}) - 1) × 100%
                                </div>
                                <div className="font-bold text-xl text-purple-900 mt-2">= {calculations.profit.irr.toFixed(2)}%</div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                            <p className="text-sm text-indigo-900">
                              <strong>💡 Разница между ROI и IRR:</strong>
                            </p>
                            <ul className="text-xs text-indigo-800 mt-2 space-y-1 ml-4 list-disc">
                              <li><strong>ROI</strong> — общая доходность проекта, НЕ учитывает время</li>
                              <li><strong>IRR</strong> — годовая ставка доходности, учитывает время (аннуализированная)</li>
                              <li>При сроке 12 месяцев: ROI ≈ IRR</li>
                              <li>При сроке &lt; 12 месяцев: IRR &gt; ROI (быстрый оборот выгоднее)</li>
                              <li>При сроке &gt; 12 месяцев: IRR &lt; ROI (деньги работают дольше)</li>
                            </ul>
                          </div>
                        </div>

                        {/* Точка безубыточности */}
                        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-5 border-2 border-yellow-200">
                          <h4 className="text-lg font-bold text-yellow-800 mb-4 flex items-center gap-2">⚖️ Точка безубыточности</h4>
                          <div className="bg-white p-4 rounded-lg border border-yellow-200">
                            <div className="font-mono space-y-1">
                              <div className="text-gray-700">Минимальная цена продажи = Затраты ÷ (1 - Комиссия продавца% × 1.05)</div>
                              <div className="text-yellow-700">
                                Минимальная цена = {formatCurrency(calculations.costs.total)} ÷ (1 - {params.sellerCommission}% × 1.05)
                              </div>
                              <div className="font-bold text-xl text-yellow-900 mt-2">= {formatCurrency(calculations.breakEven)}</div>
                            </div>
                            <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
                              <p className="text-sm text-yellow-800">
                                <strong>Примечание:</strong> При цене продажи ниже {formatCurrency(calculations.breakEven)} сделка будет убыточной.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Сенситивность */}
                  {activeTab === 'sensitivity' && (
                    <div>
                      <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Анализ чувствительности (±10%)</h3>
                      <div className="h-64 md:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={sensitivityData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="variation" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Line type="monotone" dataKey="priceChange" stroke="#3b82f6" strokeWidth={2} name="Цена продажи" />
                            <Line type="monotone" dataKey="renoChange" stroke="#8b5cf6" strokeWidth={2} name="Бюджет ремонта" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                          <p className="text-xs sm:text-sm text-gray-600 mb-2">Влияние цены продажи</p>
                          <p className="text-[11px] sm:text-xs text-gray-500">
                            +10%: {formatCurrency(sensitivityData[4]?.priceChange || 0)}<br />
                            -10%: {formatCurrency(sensitivityData[0]?.priceChange || 0)}
                          </p>
                        </div>
                        <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
                          <p className="text-xs sm:text-sm text-gray-600 mb-2">Влияние бюджета ремонта</p>
                          <p className="text-[11px] sm:text-xs text-gray-500">
                            +10%: {formatCurrency(sensitivityData[4]?.renoChange || 0)}<br />
                            -10%: {formatCurrency(sensitivityData[0]?.renoChange || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Ранняя продажа */}
                  {activeTab === 'early' && (
                    <div>
                      <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Рекомендации по ранней продаже</h3>
                      <div className="mb-3 sm:mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200 text-xs sm:text-sm">
                        <p className="text-indigo-800">
                          <strong>Период продажи:</strong> после завершения ремонта ({params.renovationMonths} мес) до конца экспозиции (+{params.listingMonths} мес)
                        </p>
                        <p className="text-indigo-800 mt-2">
                          💡 <strong>Кликните на ROI или IRR</strong>, чтобы задать целевое значение и увидеть нужную цену.
                        </p>
                      </div>

                      <div className="overflow-x-auto max-h-96 overflow-y-auto">
                        <table className="w-full text-xs sm:text-sm">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-3 sm:px-4 py-2 text-left">Неделя продажи</th>
                              <th className="px-3 sm:px-4 py-2 text-center">Всего месяцев</th>
                              <th className="px-3 sm:px-4 py-2 text-right">Скидка</th>
                              <th className="px-3 sm:px-4 py-2 text-right">Цена</th>
                              <th className="px-3 sm:px-4 py-2 text-right">Прибыль</th>
                              <th className="px-3 sm:px-4 py-2 text-right">ROI %</th>
                              <th className="px-3 sm:px-4 py-2 text-right">IRR %</th>
                              <th className="px-3 sm:px-4 py-2 text-center">Действие</th>
                            </tr>
                          </thead>
                          <tbody>
                            {earlyDiscountData.map((row, idx) => (
                              <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                                <td className="px-3 sm:px-4 py-2">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    Неделя {row.week}
                                  </div>
                                </td>
                                <td className="px-3 sm:px-4 py-2 text-center">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[11px] sm:text-xs font-medium">
                                    {row.totalMonths} мес
                                  </span>
                                </td>
                                <td className="px-3 sm:px-4 py-2 text-right text-red-600 font-medium">
                                  {row.discount >= 0 ? '-' : '+'}{formatCurrency(Math.abs(row.discount))}
                                </td>
                                <td className="px-3 sm:px-4 py-2 text-right font-medium">{formatCurrency(row.price)}</td>
                                <td className="px-3 sm:px-4 py-2 text-right">
                                  <span className={row.profit > 0 ? 'text-green-600' : 'text-red-600'}>
                                    {formatCurrency(row.profit)}
                                  </span>
                                </td>
                                <td className="px-3 sm:px-4 py-2 text-right">
                                  {editingWeek === `${row.week}-roi` ? (
                                    <input
                                      type="number" step="0.1" autoFocus defaultValue={row.roi}
                                      onBlur={(e) => { handleMetricEdit(row.week, 'roi', e.target.value); setEditingWeek(null); }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') { handleMetricEdit(row.week, 'roi', e.target.value); setEditingWeek(null); }
                                        else if (e.key === 'Escape') { setEditingWeek(null); }
                                      }}
                                      className="w-20 px-2 py-1 border border-blue-500 rounded text-right"
                                    />
                                  ) : (
                                    <button
                                      onClick={() => setEditingWeek(`${row.week}-roi`)}
                                      className={`${parseFloat(row.roi) > 0 ? 'text-blue-600' : 'text-red-600'} font-medium hover:bg-blue-50 px-2 py-1 rounded transition-colors`}
                                    >
                                      {row.roi}%
                                    </button>
                                  )}
                                </td>
                                <td className="px-3 sm:px-4 py-2 text-right">
                                  {editingWeek === `${row.week}-irr` ? (
                                    <input
                                      type="number" step="0.1" autoFocus defaultValue={row.irr}
                                      onBlur={(e) => { handleMetricEdit(row.week, 'irr', e.target.value); setEditingWeek(null); }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') { handleMetricEdit(row.week, 'irr', e.target.value); setEditingWeek(null); }
                                        else if (e.key === 'Escape') { setEditingWeek(null); }
                                      }}
                                      className="w-20 px-2 py-1 border border-purple-500 rounded text-right"
                                    />
                                  ) : (
                                    <button
                                      onClick={() => setEditingWeek(`${row.week}-irr`)}
                                      className={`${parseFloat(row.irr) > 0 ? 'text-purple-600' : 'text-red-600'} font-medium hover:bg-purple-50 px-2 py-1 rounded transition-colors`}
                                    >
                                      {row.irr}%
                                    </button>
                                  )}
                                </td>
                                <td className="px-3 sm:px-4 py-2 text-center">
                                  {customMetrics[row.week] && (
                                    <button
                                      onClick={() => clearCustomMetric(row.week)}
                                      className="text-[11px] sm:text-xs text-gray-500 hover:text-red-600 px-2 py-1 border border-gray-300 rounded hover:border-red-300 transition-colors"
                                    >
                                      Сброс
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs sm:text-sm text-blue-800 font-medium mb-2">📊 Формулы расчёта:</p>
                          <div className="space-y-2 text-[11px] sm:text-sm text-blue-800">
                            <div>
                              <strong>ROI:</strong>
                              <div className="mt-1 p-2 bg-white rounded border border-blue-100 font-mono text-[11px] sm:text-xs">
                                ROI = (Чистая прибыль / Общие затраты) × 100%
                              </div>
                            </div>
                            <div className="mt-3">
                              <strong>IRR (годовая доходность):</strong>
                              <div className="mt-1 p-2 bg-white rounded border border-blue-100 font-mono text-[11px] sm:text-xs">
                                IRR = ((Чистая выручка / Общие затраты)^(12/месяцы) - 1) × 100%
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-200 text-[11px] sm:text-sm text-purple-800">
                          <strong>Примечание:</strong> Неделя 0 = сразу после ремонта, Неделя {Math.round(params.listingMonths * 4.33)} = конец срока экспозиции (плановая дата)
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Сохранённые */}
                  {activeTab === 'saved' && (
                    <div>
                      <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Сохраненные объекты</h3>
                      {savedProperties.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Save className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
                          <p className="text-sm">Нет сохраненных объектов</p>
                          <p className="text-xs sm:text-sm mt-1">Заполните параметры и нажмите «Сохранить объект»</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {savedProperties.map((property) => (
                            <div key={property.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-gray-800 text-sm sm:text-base">
                                    {property.propertyName || 'Без названия'}
                                  </h4>
                                  <div className="flex items-center gap-3 mt-1 text-xs sm:text-sm text-gray-600">
                                    {property.location && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {property.location.split(',')[0]}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <Home className="w-3 h-3" />
                                      {property.propertyType}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs sm:text-sm">
                                    <div>
                                      <span className="text-gray-500">Покупка:</span>
                                      <p className="font-medium">{formatCurrency(property.purchasePrice)}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Продажа:</span>
                                      <p className="font-medium">{formatCurrency(property.sellingPrice)}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Прибыль:</span>
                                      <p className={`font-medium ${property?.calculations?.profit?.net > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(property?.calculations?.profit?.net ?? 0)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs sm:text-sm">
                                    <div>
                                      <span className="text-gray-500">ROI:</span>
                                      <span className="font-medium text-blue-600 ml-2">
                                        {(property?.calculations?.profit?.roi ?? 0).toFixed(1)}%
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Срок:</span>
                                      <span className="font-medium ml-2">
                                        {property?.calculations?.totalMonths ?? 0} мес
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2 shrink-0">
                                  <button
                                    onClick={() => loadProperty(property)}
                                    className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs sm:text-sm hover:bg-blue-600 transition-colors"
                                  >
                                    Загрузить
                                  </button>
                                  <button
                                    onClick={() => deleteProperty(property.id)}
                                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs sm:text-sm hover:bg-red-600 transition-colors flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={exportDealSheet}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                Экспорт листа сделки
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCalculator;
