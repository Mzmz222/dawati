import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { triggerN8N } from '../lib/n8n';
import { 
  BarChart3, 
  Users, 
  Settings as SettingsIcon, 
  TrendingUp, 
  Layout, 
  Mail,
  Lock,
  Type,
  QrCode,
  CreditCard,
  MessageCircle,
  Loader2,
  Send,
  Trash2,
  Bold,
  Italic,
  Image as ImageIcon,
  Check,
  Upload
} from 'lucide-react';

// ===================== TYPES =====================
interface FieldConfig {
  id: string;
  label: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
  enabled: boolean;
}

interface TemplateState {
  name: string;
  category: string;
  invitation_image_url: string;
  barcode_image_url: string;
  invitation_image_file: File | null;
  barcode_image_file: File | null;
  invitation_fields: FieldConfig[];
  barcode_fields: FieldConfig[];
  qr_config: { x: number; y: number; size: number; color: string };
}

// ===================== CONSTANTS =====================
const INVITATION_AVAILABLE_FIELDS: FieldConfig[] = [
  { id: 'groomName', label: 'اسم العريس', x: 50, y: 20, fontSize: 28, fontFamily: 'Amiri', color: '#1a1a1a', bold: true, italic: false, enabled: false },
  { id: 'brideName', label: 'اسم العروس', x: 50, y: 30, fontSize: 28, fontFamily: 'Amiri', color: '#1a1a1a', bold: true, italic: false, enabled: false },
  { id: 'dayName', label: 'اليوم', x: 50, y: 40, fontSize: 18, fontFamily: 'Cairo', color: '#4a4a4a', bold: true, italic: false, enabled: false },
  { id: 'time', label: 'وقت الحفل', x: 50, y: 48, fontSize: 18, fontFamily: 'Cairo', color: '#4a4a4a', bold: false, italic: false, enabled: false },
  { id: 'date', label: 'تاريخ الحفل', x: 50, y: 55, fontSize: 18, fontFamily: 'Cairo', color: '#4a4a4a', bold: false, italic: false, enabled: false },
  { id: 'city', label: 'المدينة', x: 40, y: 65, fontSize: 16, fontFamily: 'Tajawal', color: '#4a4a4a', bold: false, italic: false, enabled: false },
  { id: 'district', label: 'الحي', x: 60, y: 65, fontSize: 16, fontFamily: 'Tajawal', color: '#4a4a4a', bold: false, italic: false, enabled: false },
  { id: 'hallName', label: 'اسم القاعة', x: 50, y: 75, fontSize: 16, fontFamily: 'Cairo', color: '#4a4a4a', bold: true, italic: false, enabled: false },
];

const BARCODE_AVAILABLE_FIELDS: FieldConfig[] = [
  { id: 'groomName', label: 'اسم العريس', x: 50, y: 15, fontSize: 24, fontFamily: 'Amiri', color: '#1a1a1a', bold: true, italic: false, enabled: false },
  { id: 'brideName', label: 'اسم العروس', x: 50, y: 25, fontSize: 24, fontFamily: 'Amiri', color: '#1a1a1a', bold: true, italic: false, enabled: false },
  { id: 'dayName', label: 'اليوم', x: 50, y: 34, fontSize: 16, fontFamily: 'Cairo', color: '#4a4a4a', bold: true, italic: false, enabled: false },
  { id: 'time', label: 'وقت الحفل', x: 50, y: 42, fontSize: 16, fontFamily: 'Cairo', color: '#4a4a4a', bold: false, italic: false, enabled: false },
  { id: 'date', label: 'تاريخ الحفل', x: 50, y: 49, fontSize: 16, fontFamily: 'Cairo', color: '#4a4a4a', bold: false, italic: false, enabled: false },
  { id: 'city', label: 'المدينة', x: 40, y: 57, fontSize: 14, fontFamily: 'Tajawal', color: '#4a4a4a', bold: false, italic: false, enabled: false },
  { id: 'district', label: 'الحي', x: 60, y: 57, fontSize: 14, fontFamily: 'Tajawal', color: '#4a4a4a', bold: false, italic: false, enabled: false },
  { id: 'hallName', label: 'اسم القاعة', x: 50, y: 65, fontSize: 14, fontFamily: 'Cairo', color: '#4a4a4a', bold: true, italic: false, enabled: false },
  { id: 'companions', label: 'عدد المرافقين', x: 50, y: 90, fontSize: 14, fontFamily: 'Cairo', color: '#333', bold: true, italic: false, enabled: false },
];

const FONT_OPTIONS = [
  { value: 'Cairo', label: 'Cairo' },
  { value: 'Tajawal', label: 'Tajawal' },
  { value: 'Amiri', label: 'Amiri' },
  { value: 'Scheherazade New', label: 'Scheherazade' },
  { value: 'Almarai', label: 'Almarai' },
  { value: 'Noto Serif Arabic', label: 'Noto Serif' },
];

const FRESH_TEMPLATE = (): TemplateState => ({
  name: '', category: 'wedding',
  invitation_image_url: '', barcode_image_url: '',
  invitation_image_file: null, barcode_image_file: null,
  invitation_fields: INVITATION_AVAILABLE_FIELDS.map(f => ({ ...f })),
  barcode_fields: BARCODE_AVAILABLE_FIELDS.map(f => ({ ...f })),
  qr_config: { x: 50, y: 72, size: 80, color: '#000000' },
});

// ===================== COMPONENT =====================
export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState({ revenue: 0, customers: 0, events: 0, tickets: 0 });
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'templates' | 'tickets' | 'orders' | 'settings'>('overview');
  const [tickets, setTickets] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [waNumber, setWaNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState('');

  // Active card editor tab
  const [activeCardTab, setActiveCardTab] = useState<'invitation' | 'barcode'>('invitation');
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  // Template State
  const [template, setTemplate] = useState<TemplateState>(FRESH_TEMPLATE());

  useEffect(() => {
    if (isAuthenticated) fetchAdminData();
  }, [isAuthenticated, activeTab]);

  const fetchAdminData = async () => {
    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: eventsCount } = await supabase.from('events').select('*', { count: 'exact', head: true });
    const { count: ticketsCount } = await supabase.from('support_tickets').select('*', { count: 'exact', head: true });
    setStats({ revenue: (eventsCount || 0) * 350, customers: usersCount || 0, events: eventsCount || 0, tickets: ticketsCount || 0 });

    if (activeTab === 'tickets') {
      const { data } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
      if (data) setTickets(data);
    }
    if (activeTab === 'orders') {
      const { data } = await supabase.from('orders').select('*, users(full_name, phone), events(title)').order('created_at', { ascending: false });
      if (data) setOrders(data);
    }
    if (activeTab === 'settings') {
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'whatsapp_number').single();
      if (data) setWaNumber(data.value);
    }
    if (activeTab === 'templates') {
      const { data } = await supabase.from('templates').select('*').order('created_at', { ascending: false });
      if (data) setSavedTemplates(data);
    }
  };

  // ===================== FIELD HANDLERS =====================
  const currentFields = activeCardTab === 'invitation' ? template.invitation_fields : template.barcode_fields;
  const setCurrentFields = (fields: FieldConfig[]) => {
    setTemplate(prev => ({ ...prev, [activeCardTab === 'invitation' ? 'invitation_fields' : 'barcode_fields']: fields }));
  };
  const toggleField = (id: string) => setCurrentFields(currentFields.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  const handleFieldMove = (id: string, x: number, y: number) => setCurrentFields(currentFields.map(f => f.id === id ? { ...f, x, y } : f));
  const handleFieldUpdate = (id: string, updates: Partial<FieldConfig>) => setCurrentFields(currentFields.map(f => f.id === id ? { ...f, ...updates } : f));

  const handleImageSelect = (type: 'invitation' | 'barcode') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setTemplate(prev => ({
      ...prev,
      [type === 'invitation' ? 'invitation_image_url' : 'barcode_image_url']: previewUrl,
      [type === 'invitation' ? 'invitation_image_file' : 'barcode_image_file']: file,
    }));
  };

  // Upload a file to Supabase Storage and return public URL
  const uploadImage = async (file: File, path: string): Promise<string> => {
    const { error } = await supabase.storage.from('templates-images').upload(path, file, { upsert: true });
    if (error) throw new Error('فشل رفع الصورة: ' + error.message);
    const { data } = supabase.storage.from('templates-images').getPublicUrl(path);
    return data.publicUrl;
  };

  // ===================== SAVE TEMPLATE =====================
  const saveTemplate = async () => {
    if (!template.name.trim()) { alert('الرجاء إدخال اسم القالب'); return; }
    const userStr = localStorage.getItem('dawati_user');
    if (!userStr) { alert('يرجى تسجيل الدخول أولاً'); return; }
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') { alert('صلاحية الأدمن مطلوبة لحفظ القوالب'); return; }

    setIsLoading(true);
    try {
      let invitationUrl = template.invitation_image_url;
      let barcodeUrl = template.barcode_image_url;

      // Upload invitation image if a new file was selected
      if (template.invitation_image_file) {
        setUploadProgress('جاري رفع صورة كرت الدعوة...');
        const ext = template.invitation_image_file.name.split('.').pop();
        invitationUrl = await uploadImage(
          template.invitation_image_file,
          `${user.id}/${Date.now()}_invitation.${ext}`
        );
      }

      // Upload barcode image if a new file was selected
      if (template.barcode_image_file) {
        setUploadProgress('جاري رفع صورة كرت الباركود...');
        const ext = template.barcode_image_file.name.split('.').pop();
        barcodeUrl = await uploadImage(
          template.barcode_image_file,
          `${user.id}/${Date.now()}_barcode.${ext}`
        );
      }

      setUploadProgress('جاري حفظ القالب...');
      const enabledInvFields = template.invitation_fields.filter(f => f.enabled);
      const enabledBarcodeFields = template.barcode_fields.filter(f => f.enabled);

      const { error } = await supabase.from('templates').insert([{
        name: template.name,
        type: 'dual',
        category: template.category,
        preview_image_url: invitationUrl || barcodeUrl,
        invitation_image_url: invitationUrl,
        barcode_image_url: barcodeUrl,
        fields_config: { fields: enabledInvFields },
        barcode_fields_config: { fields: enabledBarcodeFields, qr: template.qr_config },
        qr_config: template.qr_config,
        created_by: user.id,
      }]);

      if (error) throw new Error('فشل حفظ القالب: ' + error.message);

      alert('✅ تم حفظ القالب بنجاح');
      fetchAdminData();
      setTemplate(FRESH_TEMPLATE());
      setSelectedFieldId(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
      setUploadProgress('');
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا القالب؟')) return;
    const { error } = await supabase.from('templates').delete().eq('id', id);
    if (!error) fetchAdminData();
    else alert('فشل الحذف: ' + error.message);
  };

  // ===================== OTHER HANDLERS =====================
  const handleUpdateWa = async () => {
    setIsLoading(true);
    const { error } = await supabase.from('site_settings').upsert({ key: 'whatsapp_number', value: waNumber });
    setIsLoading(false);
    if (error) alert('فشل تحديث الرقم');
    else alert('تم تحديث رقم واتساب بنجاح');
  };

  const handleApproveOrder = async (orderId: string) => {
    setIsLoading(true);
    const { error } = await supabase.from('orders').update({ status: 'paid' }).eq('id', orderId);
    if (!error) setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'paid' } : o));
    setIsLoading(false);
  };

  const handleSendOfficialInvites = async (order: any) => {
    setIsLoading(true);
    try {
      const { data: guests, error: guestError } = await supabase.from('guests').select('*').eq('event_id', order.event_id);
      if (guestError) throw guestError;
      const result = await triggerN8N({ action: 'send_bulk_invites', is_preview: false, order_id: order.id, event_id: order.event_id, guests });
      if (result.success) alert('تم إرسال الدعوات الرسمية!');
      else throw new Error(result.error);
    } catch (err: any) { alert(err.message); }
    finally { setIsLoading(false); }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '4646') setIsAuthenticated(true);
    else alert('كلمة مرور خاطئة');
  };

  // ===================== RENDER: LOGIN =====================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-zinc-100 text-center animate-scale-in">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-primary mb-4 font-headline">لوحة الإدارة</h2>
          <p className="text-zinc-500 mb-8 font-body">الرجاء إدخال كلمة المرور للمتابعة</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور" className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-center text-lg focus:ring-2 focus:ring-primary/20 transition-all font-body" />
            <button className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all active:scale-95">دخول</button>
          </form>
        </div>
      </div>
    );
  }

  // ===================== RENDER: VISUAL EDITOR =====================
  const renderVisualEditor = () => {
    const imageUrl = activeCardTab === 'invitation' ? template.invitation_image_url : template.barcode_image_url;
    const enabledFields = currentFields.filter(f => f.enabled);

    return (
      <div className="space-y-4">
        {/* Image Upload Zone */}
        {!imageUrl ? (
          <label className="flex flex-col items-center justify-center w-full aspect-[3/4] rounded-3xl border-2 border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer group">
            <div className="flex flex-col items-center gap-3 text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-primary/40" />
              </div>
              <div>
                <p className="font-bold text-primary text-sm">
                  {activeCardTab === 'invitation' ? 'ارفع صورة كرت الدعوة' : 'ارفع صورة كرت الباركود'}
                </p>
                <p className="text-zinc-400 text-xs mt-1">PNG, JPG, WebP — حتى 10 ميقا</p>
              </div>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect(activeCardTab)} />
          </label>
        ) : (
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-inner">
            <img src={imageUrl} alt="Template" className="w-full h-full object-contain select-none" draggable={false} />
            <div className="absolute inset-0">
              {enabledFields.map((field) => (
                <div
                  key={field.id}
                  onClick={() => setSelectedFieldId(field.id)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
                    const move = (ev: MouseEvent) => {
                      const x = ((ev.clientX - rect.left) / rect.width) * 100;
                      const y = ((ev.clientY - rect.top) / rect.height) * 100;
                      handleFieldMove(field.id, Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
                    };
                    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
                    window.addEventListener('mousemove', move);
                    window.addEventListener('mouseup', up);
                  }}
                  className={cn(
                    "absolute cursor-move select-none whitespace-nowrap px-2 py-0.5 rounded border-2 hover:border-primary transition-colors",
                    selectedFieldId === field.id ? "border-primary bg-primary/10 ring-2 ring-primary/20 z-40" : "border-white/60 bg-black/5"
                  )}
                  style={{
                    left: `${field.x}%`, top: `${field.y}%`, transform: 'translate(-50%, -50%)',
                    fontSize: `${field.fontSize}px`, fontFamily: field.fontFamily, color: field.color,
                    fontWeight: field.bold ? 'bold' : 'normal', fontStyle: field.italic ? 'italic' : 'normal',
                  }}
                >
                  {field.label}
                </div>
              ))}

              {activeCardTab === 'barcode' && (
                <div
                  onClick={() => setSelectedFieldId('qr')}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
                    const move = (ev: MouseEvent) => {
                      const x = ((ev.clientX - rect.left) / rect.width) * 100;
                      const y = ((ev.clientY - rect.top) / rect.height) * 100;
                      setTemplate(prev => ({ ...prev, qr_config: { ...prev.qr_config, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } }));
                    };
                    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
                    window.addEventListener('mousemove', move);
                    window.addEventListener('mouseup', up);
                  }}
                  className={cn(
                    "absolute cursor-move bg-white/80 border-2 border-dashed flex items-center justify-center rounded-xl",
                    selectedFieldId === 'qr' ? "border-primary ring-4 ring-primary/10 z-40" : "border-zinc-300"
                  )}
                  style={{
                    left: `${template.qr_config.x}%`, top: `${template.qr_config.y}%`,
                    width: `${template.qr_config.size}px`, height: `${template.qr_config.size}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <QrCode className="w-1/2 h-1/2 text-primary/30" />
                </div>
              )}
            </div>

            {/* Replace image button */}
            <label className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-primary text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-white transition-colors border border-primary/20 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> تغيير الصورة
              <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect(activeCardTab)} />
            </label>
          </div>
        )}
      </div>
    );
  };

  // ===================== RENDER: FIELD CONTROLS =====================
  const renderFieldControls = () => {
    const selectedField = currentFields.find(f => f.id === selectedFieldId);
    const isQrSelected = selectedFieldId === 'qr' && activeCardTab === 'barcode';

    return (
      <div className="space-y-5">
        {/* Field Checkboxes */}
        <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
          <p className="text-sm font-bold text-zinc-700 mb-3 flex items-center gap-2">
            <Type className="w-4 h-4 text-primary" />
            الحقول المتاحة لهذا الكرت
          </p>
          <div className="space-y-2">
            {currentFields.map(field => (
              <label key={field.id} className={cn(
                "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border select-none",
                field.enabled
                  ? "bg-primary/5 border-primary/30 shadow-sm"
                  : "bg-white border-zinc-100 hover:border-zinc-200"
              )}>
                <div
                  className={cn(
                    "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all",
                    field.enabled ? "bg-primary border-primary" : "bg-white border-zinc-300"
                  )}
                >
                  {field.enabled && <Check className="w-3 h-3 text-white" />}
                </div>
                <input type="checkbox" className="hidden" checked={field.enabled} onChange={() => toggleField(field.id)} />
                <span className="text-sm font-medium">{field.label}</span>
                {field.enabled && (
                  <button
                    onClick={(e) => { e.preventDefault(); setSelectedFieldId(field.id); }}
                    className="mr-auto text-[10px] text-primary font-bold hover:underline"
                  >
                    تخصيص
                  </button>
                )}
              </label>
            ))}

            {/* QR Code always shown in barcode tab */}
            {activeCardTab === 'barcode' && (
              <label
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border select-none",
                  selectedFieldId === 'qr' ? "bg-primary/5 border-primary/30 shadow-sm" : "bg-white border-zinc-100 hover:border-zinc-200"
                )}
                onClick={() => setSelectedFieldId(selectedFieldId === 'qr' ? null : 'qr')}
              >
                <div className="w-5 h-5 rounded-md border-2 border-primary bg-primary flex items-center justify-center flex-shrink-0">
                  <QrCode className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium">الباركود (QR Code)</span>
                <span className="mr-auto text-[10px] text-primary font-bold">دائماً مفعّل</span>
              </label>
            )}
          </div>
        </div>

        {/* Field Properties Panel */}
        <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
          <p className="text-sm font-bold text-zinc-700 mb-3">خصائص الحقل المختار</p>

          {isQrSelected ? (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-white rounded-xl border border-zinc-200 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                <span className="font-bold text-sm">إعدادات الباركود</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-500">الحجم (px)</label>
                  <input type="number" value={template.qr_config.size} min={40} max={300}
                    onChange={(e) => setTemplate(prev => ({ ...prev, qr_config: { ...prev.qr_config, size: Number(e.target.value) } }))}
                    className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-500">لون الباركود</label>
                  <input type="color" value={template.qr_config.color}
                    onChange={(e) => setTemplate(prev => ({ ...prev, qr_config: { ...prev.qr_config, color: e.target.value } }))}
                    className="w-full h-10 bg-white border border-zinc-200 rounded-xl p-1 cursor-pointer" />
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 text-center">اسحب مربع الباركود في المحرر لتحديد موضعه</p>
            </div>
          ) : selectedField && selectedField.enabled ? (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-white rounded-xl border border-zinc-200 flex items-center gap-2">
                <Type className="w-5 h-5 text-primary" />
                <span className="font-bold text-sm">{selectedField.label}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-500">حجم الخط</label>
                  <input type="number" value={selectedField.fontSize} min={8} max={72}
                    onChange={(e) => handleFieldUpdate(selectedField.id, { fontSize: Number(e.target.value) })}
                    className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-500">لون النص</label>
                  <input type="color" value={selectedField.color}
                    onChange={(e) => handleFieldUpdate(selectedField.id, { color: e.target.value })}
                    className="w-full h-10 bg-white border border-zinc-200 rounded-xl p-1 cursor-pointer" />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs text-zinc-500">نوع الخط</label>
                  <select value={selectedField.fontFamily}
                    onChange={(e) => handleFieldUpdate(selectedField.id, { fontFamily: e.target.value })}
                    className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                    style={{ fontFamily: selectedField.fontFamily }}>
                    {FONT_OPTIONS.map(f => (
                      <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 flex gap-3">
                  <button
                    onClick={() => handleFieldUpdate(selectedField.id, { bold: !selectedField.bold })}
                    className={cn("flex-1 p-2.5 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all text-sm",
                      selectedField.bold ? "border-primary bg-primary/5 text-primary" : "border-zinc-200 text-zinc-400 hover:border-zinc-300")}
                  >
                    <Bold className="w-4 h-4" /> عريض
                  </button>
                  <button
                    onClick={() => handleFieldUpdate(selectedField.id, { italic: !selectedField.italic })}
                    className={cn("flex-1 p-2.5 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all text-sm",
                      selectedField.italic ? "border-primary bg-primary/5 text-primary" : "border-zinc-200 text-zinc-400 hover:border-zinc-300")}
                  >
                    <Italic className="w-4 h-4" /> مائل
                  </button>
                </div>
              </div>
              <div
                className="p-3 rounded-xl text-center border border-dashed border-zinc-200 text-sm"
                style={{
                  fontFamily: selectedField.fontFamily,
                  fontSize: Math.min(selectedField.fontSize, 24) + 'px',
                  color: selectedField.color,
                  fontWeight: selectedField.bold ? 'bold' : 'normal',
                  fontStyle: selectedField.italic ? 'italic' : 'normal',
                }}
              >
                {selectedField.label}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-xl border-2 border-dashed border-zinc-200">
              <Type className="w-8 h-8 mx-auto text-zinc-200 mb-2" />
              <p className="text-xs text-zinc-400">فعّل حقلاً ثم اضغط "تخصيص" لتغيير مظهره</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ===================== RENDER: MAIN =====================
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 font-body pb-32 text-right">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-extrabold text-primary font-headline tracking-tight">إدارة المنصة</h2>
          <p className="text-zinc-500 text-lg">مرحباً بك، استعرض أداء "دعواتي" وقم بإدارة العمليات.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col justify-between group hover:shadow-xl transition-shadow">
          <div>
            <span className="text-tertiary font-bold text-[10px] tracking-[0.2em] uppercase mb-2 block">إجمالي الإيرادات</span>
            <h3 className="text-3xl font-black text-primary font-headline">{stats.revenue.toLocaleString()} <span className="text-sm font-normal text-zinc-400">ر.س</span></h3>
          </div>
          <div className="mt-6 flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <TrendingUp className="w-4 h-4" /><span>+١٢٪ هذا الشهر</span>
          </div>
        </div>
        <div className="bg-primary text-on-primary p-8 rounded-3xl shadow-xl flex flex-col justify-between">
          <Users className="w-10 h-10 opacity-30" />
          <div><h3 className="text-3xl font-black font-headline">{stats.customers}</h3><p className="opacity-90 font-bold text-sm">عميل مسجل</p></div>
        </div>
        <div className="bg-secondary-container text-on-secondary-container p-8 rounded-3xl shadow-sm flex flex-col justify-between">
          <Layout className="w-10 h-10 opacity-30" />
          <div><h3 className="text-3xl font-black font-headline">{stats.events}</h3><p className="opacity-80 font-bold text-sm">مناسبة نشطة</p></div>
        </div>
        <div className="bg-zinc-50 p-8 rounded-3xl border border-zinc-100 flex flex-col justify-between">
          <Mail className="w-10 h-10 text-zinc-300" />
          <div><h3 className="text-3xl font-black text-zinc-800 font-headline">{stats.tickets}</h3><p className="text-zinc-500 font-bold text-sm">تذكرة دعم</p></div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex bg-zinc-100 rounded-2xl p-1 w-full md:w-fit overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
          { id: 'orders', label: 'الطلبات', icon: CreditCard },
          { id: 'users', label: 'العملاء', icon: Users },
          { id: 'templates', label: 'القوالب', icon: SettingsIcon },
          { id: 'tickets', label: 'الدعم الفني', icon: Mail },
          { id: 'settings', label: 'الإعدادات', icon: MessageCircle }
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={cn("flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
              activeTab === tab.id ? "bg-white text-primary shadow-sm" : "text-zinc-500 hover:bg-white/50")}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-8 pb-12">
        {activeTab === 'templates' ? (
          <div className="space-y-8">
            {/* Template Editor */}
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-zinc-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-primary font-headline">محرر القوالب البصري</h3>
                  <p className="text-zinc-500 text-sm">ارفع صورة كل كرت، فعّل الحقول واسحبها لتحديد مواضعها، ثم احفظ.</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <input type="text" value={template.name} onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="اسم القالب..." className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 w-48" />
                  <select value={template.category} onChange={(e) => setTemplate(prev => ({ ...prev, category: e.target.value }))}
                    className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20">
                    <option value="wedding">زفاف</option>
                    <option value="graduation">تخرج</option>
                    <option value="birthday">عيد ميلاد</option>
                  </select>
                  <button onClick={saveTemplate} disabled={isLoading}
                    className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2 text-sm disabled:opacity-60">
                    {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />{uploadProgress || 'جاري الحفظ...'}</> : 'حفظ القالب'}
                  </button>
                </div>
              </div>

              {/* Card Tabs */}
              <div className="flex gap-3 mb-8">
                <button onClick={() => { setActiveCardTab('invitation'); setSelectedFieldId(null); }}
                  className={cn("flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all",
                    activeCardTab === 'invitation' ? "border-primary bg-primary/5 text-primary" : "border-zinc-200 text-zinc-400 hover:border-zinc-300")}>
                  <ImageIcon className="w-4 h-4" /> كرت الدعوة
                  {template.invitation_image_url && <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></span>}
                </button>
                <button onClick={() => { setActiveCardTab('barcode'); setSelectedFieldId(null); }}
                  className={cn("flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all",
                    activeCardTab === 'barcode' ? "border-primary bg-primary/5 text-primary" : "border-zinc-200 text-zinc-400 hover:border-zinc-300")}>
                  <QrCode className="w-4 h-4" /> كرت الباركود
                  {template.barcode_image_url && <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></span>}
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                <div className="xl:col-span-7">{renderVisualEditor()}</div>
                <div className="xl:col-span-5">{renderFieldControls()}</div>
              </div>
            </div>

            {/* Saved Templates */}
            {savedTemplates.length > 0 && (
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-zinc-100">
                <h3 className="text-xl font-bold text-primary font-headline mb-6">القوالب المحفوظة ({savedTemplates.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedTemplates.map((t) => (
                    <div key={t.id} className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 space-y-4 group hover:border-zinc-200 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm">{t.name}</h4>
                          <span className="text-[10px] text-zinc-400 font-mono">#{t.id?.slice(0, 8)}</span>
                        </div>
                        <button onClick={() => deleteTemplate(t.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        {t.invitation_image_url && (
                          <div className="flex-1 space-y-1">
                            <p className="text-[10px] text-zinc-400 text-center">كرت الدعوة</p>
                            <img src={t.invitation_image_url} className="w-full h-28 object-cover rounded-xl" />
                          </div>
                        )}
                        {t.barcode_image_url && (
                          <div className="flex-1 space-y-1">
                            <p className="text-[10px] text-zinc-400 text-center">كرت الباركود</p>
                            <img src={t.barcode_image_url} className="w-full h-28 object-cover rounded-xl" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        ) : activeTab === 'tickets' ? (
          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
            <table className="w-full text-right font-body">
              <thead><tr className="bg-zinc-50 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                <th className="px-8 py-5">العميل</th><th className="px-8 py-5">الرسالة</th><th className="px-8 py-5 text-center">الإجراء</th>
              </tr></thead>
              <tbody className="divide-y divide-zinc-100">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-8 py-5"><div className="font-bold">{t.name}</div><div className="text-xs text-zinc-400">{t.phone}</div></td>
                    <td className="px-8 py-5 text-sm text-zinc-600 max-w-md truncate">{t.message}</td>
                    <td className="px-8 py-5 text-center">
                      <a
                        href={`https://wa.me/${t.phone?.startsWith('0') ? '966' + t.phone.slice(1) : t.phone}?text=${encodeURIComponent(`مرحباً ${t.name}، بخصوص استفسارك في منصة دعواتي: `)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors px-4 py-2 rounded-xl text-sm font-bold"
                      >
                        <MessageCircle className="w-4 h-4" /> رد عبر واتساب
                      </a>
                    </td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr><td colSpan={3} className="px-8 py-16 text-center text-zinc-400">لا توجد تذاكر دعم حالياً</td></tr>
                )}
              </tbody>
            </table>
          </div>

        ) : activeTab === 'orders' ? (
          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
            <table className="w-full text-right font-body">
              <thead><tr className="bg-zinc-50 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                <th className="px-8 py-5">العميل / المناسبة</th><th className="px-8 py-5">المبلغ</th><th className="px-8 py-5 text-center">الحالة</th><th className="px-8 py-5 text-center">الإجراء</th>
              </tr></thead>
              <tbody className="divide-y divide-zinc-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="font-bold">{o.users?.full_name}</div>
                      <div className="text-xs text-primary">{o.events?.title}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">#{o.id}</div>
                    </td>
                    <td className="px-8 py-5"><div className="font-bold text-lg">{o.amount} ر.س</div></td>
                    <td className="px-8 py-5 text-center">
                      <span className={cn("px-4 py-1.5 rounded-full text-xs font-bold",
                        o.status === 'paid' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                        {o.status === 'paid' ? 'مدفوع' : 'بانتظار التحويل'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {o.status === 'paid' ? (
                          <button disabled={isLoading} onClick={() => handleSendOfficialInvites(o)}
                            className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:shadow-lg transition-all">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}إرسال الدعوات
                          </button>
                        ) : (
                          <button disabled={isLoading} onClick={() => handleApproveOrder(o.id)}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:shadow-lg transition-all">
                            تأكيد الدفع يدوياً
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        ) : activeTab === 'settings' ? (
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-zinc-100">
            <div className="max-w-md space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-primary font-headline">إعدادات عامة</h3>
                <p className="text-zinc-500 text-sm">إدارة المتغيرات العالمية للموقع.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 px-1">رقم واتساب الاستقبال</label>
                  <input type="text" value={waNumber} onChange={(e) => setWaNumber(e.target.value)}
                    placeholder="9665xxxxxxxx" className="w-full bg-zinc-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20" />
                </div>
                <button onClick={handleUpdateWa} disabled={isLoading}
                  className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-3">
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'حفظ التغييرات'}
                </button>
              </div>
            </div>
          </div>

        ) : (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 text-center py-20">
            <BarChart3 className="w-16 h-16 mx-auto mb-6 text-zinc-200" />
            <p className="text-zinc-400 font-body mb-4">اختر أحد التبويبات لعرض البيانات التفصيلية.</p>
          </div>
        )}
      </div>
    </div>
  );
}
