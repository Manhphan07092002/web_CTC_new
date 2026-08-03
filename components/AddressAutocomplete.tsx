import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Building, Loader2, Check, X, Layers, Search, Navigation, History, Sparkles, Home } from 'lucide-react';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface ProvinceV2 {
  code: number;
  name: string;
  codename: string;
  division_type: string;
}

export interface WardV2 {
  code: number;
  name: string;
  codename: string;
  division_type: string;
  province_code: number;
}

const API_V2_URL = "https://provinces.open-api.vn/api/v2";
const RECENT_ADDRESSES_KEY = "ctc_recent_addresses_v2";

const POPULAR_CITIES = [
  { name: "Đà Nẵng", code: 48 },
  { name: "TP. Hồ Chí Minh", code: 79 },
  { name: "Hà Nội", code: 1 },
  { name: "TP. Huế", code: 46 },
  { name: "Quảng Nam", code: 49 },
  { name: "Hải Phòng", code: 31 },
  { name: "Cần Thơ", code: 92 },
  { name: "Bình Dương", code: 74 },
  { name: "Đồng Nai", code: 75 }
];

const FALLBACK_PROVINCES: ProvinceV2[] = [
  { code: 1, name: "Thành phố Hà Nội", codename: "ha_noi", division_type: "thành phố trung ương" },
  { code: 48, name: "Thành phố Đà Nẵng", codename: "da_nang", division_type: "thành phố trung ương" },
  { code: 79, name: "Thành phố Hồ Chí Minh", codename: "ho_chi_minh", division_type: "thành phố trung ương" },
  { code: 31, name: "Thành phố Hải Phòng", codename: "hai_phong", division_type: "thành phố trung ương" },
  { code: 92, name: "Thành phố Cần Thơ", codename: "can_tho", division_type: "thành phố trung ương" },
  { code: 46, name: "Thành phố Huế", codename: "hue", division_type: "thành phố trung ương" },
  { code: 49, name: "Tỉnh Quảng Nam", codename: "quang_nam", division_type: "tỉnh" },
  { code: 56, name: "Tỉnh Khánh Hòa", codename: "khanh_hoa", division_type: "tỉnh" },
  { code: 52, name: "Tỉnh Bình Định", codename: "binh_dinh", division_type: "tỉnh" },
  { code: 51, name: "Tỉnh Quảng Ngãi", codename: "quang_ngai", division_type: "tỉnh" },
  { code: 75, name: "Tỉnh Đồng Nai", codename: "dong_nai", division_type: "tỉnh" },
  { code: 74, name: "Tỉnh Bình Dương", codename: "binh_duong", division_type: "tỉnh" },
  { code: 77, name: "Tỉnh Bà Rịa - Vũng Tàu", codename: "ba_ria_vung_tau", division_type: "tỉnh" },
  { code: 40, name: "Tỉnh Nghệ An", codename: "nghe_an", division_type: "tỉnh" },
  { code: 38, name: "Tỉnh Thanh Hóa", codename: "thanh_hoa", division_type: "tỉnh" },
  { code: 22, name: "Tỉnh Quảng Ninh", codename: "quang_ninh", division_type: "tỉnh" },
  { code: 27, name: "Tỉnh Bắc Ninh", codename: "bac_ninh", division_type: "tỉnh" },
  { code: 68, name: "Tỉnh Lâm Đồng", codename: "lam_dong", division_type: "tỉnh" },
  { code: 66, name: "Tỉnh Đắc Lắk", codename: "dak_lak", division_type: "tỉnh" }
];

const removeVietnameseTones = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
};

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  error,
  placeholder = "Nhập địa chỉ giao hàng / lắp đặt...",
  required = false,
  disabled = false,
  className = ""
}) => {
  const [mode, setMode] = useState<'structured' | 'direct'>('structured');
  
  // Province & Ward API State
  const [provinces, setProvinces] = useState<ProvinceV2[]>([]);
  const [wards, setWards] = useState<WardV2[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | ''>('');
  const [selectedWardCode, setSelectedWardCode] = useState<number | ''>('');
  
  // Specific house number / street detail
  const [houseDetail, setHouseDetail] = useState<string>('');
  const [detectedArea, setDetectedArea] = useState<string>('');

  const [isLoadingProvinces, setIsLoadingProvinces] = useState<boolean>(false);
  const [isLoadingWards, setIsLoadingWards] = useState<boolean>(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState<boolean>(false);
  const [gpsSuccess, setGpsSuccess] = useState<boolean>(false);

  // Direct autocomplete search states & recent addresses
  const [recentAddresses, setRecentAddresses] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const houseInputRef = useRef<HTMLInputElement>(null);

  // Load recent addresses from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_ADDRESSES_KEY);
      if (stored) setRecentAddresses(JSON.parse(stored));
    } catch (e) {}
  }, []);

  const saveRecentAddress = (addr: string) => {
    if (!addr || addr.trim().length < 5) return;
    try {
      const clean = addr.trim();
      const updated = [clean, ...recentAddresses.filter(a => a !== clean)].slice(0, 5);
      setRecentAddresses(updated);
      localStorage.setItem(RECENT_ADDRESSES_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  // 1. Fetch Provinces list on mount (Open API v2)
  useEffect(() => {
    const fetchProvinces = async () => {
      setIsLoadingProvinces(true);
      try {
        const res = await fetch(`${API_V2_URL}/p/`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setProvinces(data);
          } else {
            setProvinces(FALLBACK_PROVINCES);
          }
        } else {
          setProvinces(FALLBACK_PROVINCES);
        }
      } catch (err) {
        setProvinces(FALLBACK_PROVINCES);
      } finally {
        setIsLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // 2. Fetch Wards when Province selection changes (Open API v2)
  useEffect(() => {
    if (!selectedProvinceCode) {
      setWards([]);
      setSelectedWardCode('');
      return;
    }

    const fetchWards = async () => {
      setIsLoadingWards(true);
      try {
        const res = await fetch(`${API_V2_URL}/w/?province=${selectedProvinceCode}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setWards(data);
          }
        }
      } catch (err) {
        console.error('Error fetching wards:', err);
      } finally {
        setIsLoadingWards(false);
      }
    };

    fetchWards();
  }, [selectedProvinceCode]);

  // Combine full address string in structured mode
  const updateFullAddress = (pCode: number | '', wCode: number | '', detail: string, baseArea: string = '') => {
    const provinceObj = provinces.find(p => p.code === Number(pCode));
    const wardObj = wards.find(w => w.code === Number(wCode));

    const parts: string[] = [];
    if (detail.trim()) parts.push(detail.trim());

    if (baseArea) {
      parts.push(baseArea);
    } else {
      if (wardObj) parts.push(wardObj.name);
      if (provinceObj) parts.push(provinceObj.name);
    }

    const fullAddr = parts.join(', ');
    onChange(fullAddr);
    if (onSelect && fullAddr) onSelect(fullAddr);
    if (fullAddr.length >= 8) saveRecentAddress(fullAddr);
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value ? Number(e.target.value) : '';
    setSelectedProvinceCode(val);
    setSelectedWardCode('');
    setDetectedArea('');
    updateFullAddress(val, '', houseDetail, '');
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value ? Number(e.target.value) : '';
    setSelectedWardCode(val);
    updateFullAddress(selectedProvinceCode, val, houseDetail, '');
  };

  const handleHouseDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHouseDetail(val);
    if (mode === 'structured') {
      updateFullAddress(selectedProvinceCode, selectedWardCode, val, detectedArea);
    } else {
      const parts = [];
      if (val.trim()) parts.push(val.trim());
      if (detectedArea) parts.push(detectedArea);
      const full = parts.join(', ');
      onChange(full);
      if (onSelect && full) onSelect(full);
    }
  };

  // Smart Auto-Detect Current GPS Location
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt của bạn không hỗ trợ xác định vị trí GPS.");
      return;
    }

    setIsLocatingGPS(true);
    setGpsSuccess(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'vi' } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data) {
              const addrObj = data.address || {};
              // Extract house number / road if Nominatim provides it
              const houseNum = addrObj.house_number || '';
              const roadName = addrObj.road || addrObj.pedestrian || addrObj.street || '';
              
              let autoHouseDetail = '';
              if (houseNum && roadName) {
                autoHouseDetail = `${houseNum} ${roadName}`;
              } else if (roadName) {
                autoHouseDetail = roadName;
              }

              // Area parts (Ward, City, Country)
              const areaParts: string[] = [];
              const wardName = addrObj.suburb || addrObj.village || addrObj.quarter || addrObj.city_district || addrObj.town || '';
              const cityName = addrObj.city || addrObj.state || addrObj.province || '';
              
              if (wardName) areaParts.push(wardName);
              if (cityName) areaParts.push(cityName);
              if (!areaParts.includes('Việt Nam')) areaParts.push('Việt Nam');

              const areaStr = areaParts.length > 0 ? areaParts.join(', ') : (data.display_name || '');
              
              setDetectedArea(areaStr);
              if (autoHouseDetail) setHouseDetail(autoHouseDetail);

              const fullGPSAddr = autoHouseDetail ? `${autoHouseDetail}, ${areaStr}` : areaStr;
              onChange(fullGPSAddr);
              if (onSelect) onSelect(fullGPSAddr);
              saveRecentAddress(fullGPSAddr);
              
              setGpsSuccess(true);
              setTimeout(() => setGpsSuccess(false), 3000);

              // Auto focus house detail input if house number wasn't pinpointed
              setTimeout(() => {
                if (houseInputRef.current) houseInputRef.current.focus();
              }, 200);
            }
          }
        } catch (e) {
          alert("Không thể định vị địa chỉ chi tiết. Vui lòng chọn Tỉnh/Xã thủ công.");
        } finally {
          setIsLocatingGPS(false);
        }
      },
      (error) => {
        setIsLocatingGPS(false);
        alert("Vui lòng cấp quyền truy cập vị trí GPS trên thiết bị của bạn.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Direct autocomplete search effect
  useEffect(() => {
    if (mode !== 'direct') return;
    const trimmed = value.trim();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&countrycodes=vn&addressdetails=1&limit=6`,
          { headers: { 'Accept-Language': 'vi' } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data) && data.length > 0) {
            setSuggestions(data.map((item: any) => item.display_name));
            setIsOpen(true);
          }
        }
      } catch (e) {
        // Ignore
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, mode]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="space-y-3 w-full">
      {/* Smart GPS Button & Quick Location Chips */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* 1-Click GPS Auto-location */}
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isLocatingGPS}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/80 border border-sky-200 dark:border-sky-800 rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-sm"
        >
          {isLocatingGPS ? (
            <>
              <Loader2 size={14} className="animate-spin text-primary" />
              <span>Đang quét GPS vị trí...</span>
            </>
          ) : gpsSuccess ? (
            <>
              <Check size={14} className="text-emerald-500" />
              <span className="text-emerald-600 font-bold">Đã định vị vị trí thành công!</span>
            </>
          ) : (
            <>
              <Navigation size={14} className="text-primary" />
              <span>📍 Vị trí hiện tại của tôi</span>
            </>
          )}
        </button>

        {/* Popular Cities Pills */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-0.5 scrollbar-none">
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mr-1 flex items-center gap-1">
            <Sparkles size={10} className="text-amber-500" /> Nổi bật:
          </span>
          {POPULAR_CITIES.slice(0, 4).map(city => (
            <button
              key={city.code}
              type="button"
              onClick={() => {
                setMode('structured');
                setSelectedProvinceCode(city.code);
                setSelectedWardCode('');
                setDetectedArea('');
                updateFullAddress(city.code, '', houseDetail, '');
              }}
              className={`px-2.5 py-1 text-[11px] rounded-lg border transition-all ${
                selectedProvinceCode === city.code
                  ? 'bg-primary text-white border-primary font-bold shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selector Mode Toggle Tabs */}
      <div className="flex items-center justify-between text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setMode('structured')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
            mode === 'structured'
              ? 'bg-white dark:bg-slate-700 text-primary shadow-sm font-bold'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
          }`}
        >
          <Layers size={13} />
          <span>Chọn Tỉnh / Phường (Sáp nhập 2025)</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('direct')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
            mode === 'direct'
              ? 'bg-white dark:bg-slate-700 text-primary shadow-sm font-bold'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
          }`}
        >
          <Search size={13} />
          <span>Gõ tìm kiếm trực tiếp</span>
        </button>
      </div>

      {mode === 'structured' ? (
        <div className="space-y-3">
          {/* Select Tỉnh/Thành phố & Xã/Phường/Đặc khu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Tỉnh / Thành phố */}
            <div>
              <div className="relative">
                <select
                  disabled={disabled || isLoadingProvinces}
                  value={selectedProvinceCode}
                  onChange={handleProvinceChange}
                  className={`w-full py-2.5 px-3 text-xs sm:text-sm bg-gray-50 dark:bg-gray-750 border rounded-xl focus:outline-none transition-all appearance-none cursor-pointer ${
                    error && !selectedProvinceCode
                      ? 'border-red-500 text-red-900 dark:text-red-200'
                      : 'border-gray-250 dark:border-gray-650 focus:ring-2 focus:ring-primary/20 text-gray-800 dark:text-white'
                  }`}
                >
                  <option value="">-- Chọn Tỉnh / Thành phố (34 Tỉnh) --</option>
                  {provinces.map(p => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {isLoadingProvinces && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary" size={14} />
                )}
              </div>
            </div>

            {/* Xã / Phường / Đặc khu */}
            <div>
              <div className="relative">
                <select
                  disabled={disabled || !selectedProvinceCode || isLoadingWards}
                  value={selectedWardCode}
                  onChange={handleWardChange}
                  className={`w-full py-2.5 px-3 text-xs sm:text-sm bg-gray-50 dark:bg-gray-750 border rounded-xl focus:outline-none transition-all appearance-none cursor-pointer disabled:opacity-60 ${
                    error && selectedProvinceCode && !selectedWardCode
                      ? 'border-red-500 text-red-900 dark:text-red-200'
                      : 'border-gray-250 dark:border-gray-650 focus:ring-2 focus:ring-primary/20 text-gray-800 dark:text-white'
                  }`}
                >
                  <option value="">-- Chọn Xã / Phường / Đặc khu --</option>
                  {wards.map(w => (
                    <option key={w.code} value={w.code}>
                      {w.name}
                    </option>
                  ))}
                </select>
                {isLoadingWards && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary" size={14} />
                )}
              </div>
            </div>
          </div>

          {/* GPS Detected Area Display Badge */}
          {detectedArea && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
              <span className="font-semibold">Vùng định vị GPS: <span className="font-bold text-amber-700 dark:text-amber-300">{detectedArea}</span></span>
              <button
                type="button"
                onClick={() => setDetectedArea('')}
                className="text-amber-600 dark:text-amber-400 hover:underline font-bold text-[11px]"
              >
                Xóa
              </button>
            </div>
          )}

          {/* House Number & Street Name Detail Input (BỔ SUNG SỐ NHÀ TÊN ĐƯỜNG) */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-primary dark:text-sky-400 flex items-center gap-1">
              <Home size={12} />
              <span>Số nhà, tên đường / kiệt / ngõ (Bắt buộc chi tiết):</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" size={16} />
              <input
                ref={houseInputRef}
                type="text"
                disabled={disabled}
                placeholder="VD: K20/15 Lê Văn Hiến hoặc Số 154 Nguyễn Văn Linh..."
                value={houseDetail}
                onChange={handleHouseDetailChange}
                className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border-2 rounded-xl focus:outline-none transition-all ${
                  !houseDetail.trim()
                    ? 'border-amber-400/80 focus:ring-2 focus:ring-amber-400/20 text-slate-900 dark:text-white'
                    : 'border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white'
                }`}
              />
            </div>
          </div>

          {/* Full Address Preview */}
          {value && (
            <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
              <Building size={16} className="text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-emerald-800 dark:text-emerald-300">Địa chỉ giao hàng hoàn chỉnh: </span>
                <span className="font-medium text-gray-800 dark:text-slate-100">{value}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Direct Autocomplete Input with Recent Addresses */
        <div className="space-y-3">
          <div className="relative">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                required={required}
                disabled={disabled}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => {
                  if (recentAddresses.length > 0 || suggestions.length > 0) setIsOpen(true);
                }}
                className={`w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-gray-50 dark:bg-gray-750 border rounded-xl focus:outline-none transition-all ${
                  error
                    ? 'border-red-500 text-red-900 dark:text-red-200'
                    : 'border-gray-250 dark:border-gray-650 focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white'
                }`}
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary" size={14} />
              )}
            </div>

            {/* Dropdown for Suggestions or Recent Addresses */}
            {isOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 max-h-60 overflow-y-auto py-1.5 animate-in fade-in zoom-in-95 duration-150">
                {/* Recent Addresses */}
                {!value.trim() && recentAddresses.length > 0 && (
                  <div>
                    <div className="px-3.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-700/60 flex items-center gap-1">
                      <History size={11} /> Địa chỉ vừa dùng gần đây
                    </div>
                    {recentAddresses.map((addr, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          onChange(addr);
                          if (onSelect) onSelect(addr);
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs hover:bg-sky-50 dark:hover:bg-slate-700/60 text-gray-800 dark:text-gray-200 flex items-center justify-between"
                      >
                        <span className="line-clamp-1">{addr}</span>
                        <span className="text-[10px] text-primary font-semibold">Chọn lại</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* API Suggestions */}
                {suggestions.length > 0 && (
                  <div>
                    <div className="px-3.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-700/60">
                      Gợi ý địa chỉ chính xác
                    </div>
                    {suggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          onChange(item);
                          if (onSelect) onSelect(item);
                          saveRecentAddress(item);
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-sky-50 dark:hover:bg-slate-700/60 text-gray-800 dark:text-gray-200 flex items-start gap-2"
                      >
                        <MapPin size={13} className="text-primary mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{item}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* House Detail Input even in Direct Mode */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-primary dark:text-sky-400 flex items-center gap-1">
              <Home size={12} />
              <span>Số nhà, tên đường / kiệt / ngõ (Bổ sung chi tiết):</span>
            </label>
            <input
              ref={houseInputRef}
              type="text"
              placeholder="VD: K20/15 Lê Văn Hiến hoặc Số 154 Nguyễn Văn Linh..."
              value={houseDetail}
              onChange={handleHouseDetailChange}
              className="w-full pl-4 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border-2 border-sky-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white transition-all"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
