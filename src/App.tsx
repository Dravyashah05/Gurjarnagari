import React, { useState, useEffect, useRef } from 'react';

const hornSoundUrl = '/horn_sound.mp3';
const announcementUrl = '/announcement.mp3';
const bgSlide1 = '/bg-slides/bus_bg.png';
const bgSlide2 = '/bg-slides/bus_bg2.png';
const bgSlide3 = '/bg-slides/bus_bg3.png';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  ExternalLink,
  Radio,
  Music,
  List,
  Clock,
  Wind,
  Megaphone,
  Ticket,
  QrCode,
  Printer,
  Share2,
  Plus,
  X,
  Check,
  Sparkles,
  User,
  MapPin,
  Calendar,
  Hash,
  Trash2,
  Sun,
  CloudSun,
  CloudRain,
  Thermometer,
  Droplets
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Custom Bus Horn PNG Icon
const HornIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <img 
    src="https://img.icons8.com/?size=100&id=cHhXVCb6cAi5&format=png&color=000000" 
    alt="Horn"
    referrerPolicy="no-referrer"
    className={`${className} object-contain brightness-0 invert`}
  />
);

// Extend Window interface for YouTube IFrame API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

// Ticket Data Model
export interface TicketData {
  id: string;
  depotName: string;
  ticketNo: string;
  date: string;
  time: string;
  busServiceCode: string;
  ticketTypeBanner: string;
  fromLocation: string;
  toLocation: string;
  totalDistanceKms: string;
  gstAmount: number;
  baseFare: number;
  tollFare?: number;
  insFare?: number;
  hrFare?: number;
  passengerCountText: string;
  fare: number;
  txnNo: string;
  busRegNo: string;
  driverInfo: string;
  machineSerialNo: string;
  passengerName?: string;
  seatNo?: string;
  status: 'CONFIRMED' | 'COMPLETED';
  isCustom?: boolean;
}

const INITIAL_TICKETS: TicketData[] = [
  {
    id: 'tkt-001',
    depotName: 'SURAT MOFF. DEPOT',
    ticketNo: '00006464',
    date: '14/07/26',
    time: '17:58:28',
    busServiceCode: 'ORDINARY SRT089843 36',
    ticketTypeBanner: '** PASSENGER TICKET (QT) **',
    fromLocation: 'SONGADH',
    toLocation: 'SURAT CENTR',
    totalDistanceKms: '82.0 KMs',
    gstAmount: 0.0,
    baseFare: 136.00,
    tollFare: 14.0,
    insFare: 0.0,
    hrFare: 0.0,
    passengerCountText: 'FULL : 2 x 68.0 = ₹ 136.00',
    fare: 136.00,
    txnNo: 'GSDQR19855454',
    busRegNo: 'GJ-18-Z-8936',
    driverInfo: '002 DRIVER: 22154',
    machineSerialNo: 'S/N:OTPLP3260126001387 V2.4',
    passengerName: 'ધ્રુવ વ્યાસ (૨ મુસાફર)',
    seatNo: 'OPEN SEATING',
    status: 'CONFIRMED',
    isCustom: false
  },
  {
    id: 'tkt-002',
    depotName: 'AHMEDABAD PREMIUM DEPOT',
    ticketNo: '00024629',
    date: '15/05/25',
    time: '18:53:10',
    busServiceCode: 'ELECTRIC ABDVL05139 1183',
    ticketTypeBanner: '** PASSENGER TICKET (QT) **',
    fromLocation: 'TOWER 1',
    toLocation: 'AHMEDABAD V',
    totalDistanceKms: '29.28 KMs',
    gstAmount: 2.0,
    baseFare: 40.00,
    tollFare: 0.0,
    insFare: 0.0,
    hrFare: 0.0,
    passengerCountText: 'FULL : 1 x 42.0 = ₹ 42.00',
    fare: 42.00,
    txnNo: 'GSDQR5839831',
    busRegNo: 'GJ-01-JT-8782',
    driverInfo: '003 DRIVER: 0',
    machineSerialNo: 'S/N:OTPLP3230721000587 V2.0',
    passengerName: 'રાજેશભાઈ પટેલ',
    seatNo: 'OPEN SEAT',
    status: 'CONFIRMED',
    isCustom: false
  },
  {
    id: 'tkt-003',
    depotName: 'AHMEDABAD CENTRAL DEPOT',
    ticketNo: '00089124',
    date: '16/08/26',
    time: '08:30:15',
    busServiceCode: 'EXPRESS GJ01Z9832 402',
    ticketTypeBanner: '** PASSENGER TICKET (EXPRESS) **',
    fromLocation: 'AHMEDABAD GEETA MANDIR',
    toLocation: 'RAJKOT CENTRAL',
    totalDistanceKms: '215.50 KMs',
    gstAmount: 9.0,
    baseFare: 176.00,
    tollFare: 10.0,
    insFare: 1.0,
    hrFare: 0.0,
    passengerCountText: 'FULL : 1 x 185.0 = ₹ 185.00',
    fare: 185.00,
    txnNo: 'GSDQR8839201',
    busRegNo: 'GJ-01-Z-9832',
    driverInfo: '104 DRIVER: 892',
    machineSerialNo: 'S/N:OTPLP982019230012 V2.0',
    passengerName: 'ભાવનાબેન મહેતા',
    seatNo: '14B (WINDOW)',
    status: 'CONFIRMED',
    isCustom: false
  }
];

// Single component App as required
export default function App() {
  // --- States ---
  // Background Slides State
  const bgSlides = [bgSlide1, bgSlide2, bgSlide3];
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // --- Digital Tickets State ---
  const [tickets, setTickets] = useState<TicketData[]>(() => {
    try {
      const saved = localStorage.getItem('gsrtc_digital_tickets');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TICKETS;
  });

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketCopiedToast, setTicketCopiedToast] = useState<string | null>(null);

  // New Ticket Form State
  const [formPassenger, setFormPassenger] = useState('ધ્રુવ વ્યાસ');
  const [formFrom, setFormFrom] = useState('AHMEDABAD');
  const [formTo, setFormTo] = useState('RAJKOT');
  const [formBusType, setFormBusType] = useState('GURJARNAGRI');
  const [formDate, setFormDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [formTime, setFormTime] = useState('18:50:00');
  const [formSeat, setFormSeat] = useState('14B (WINDOW)');
  const [formFare, setFormFare] = useState(185);

  // Save tickets to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('gsrtc_digital_tickets', JSON.stringify(tickets));
    } catch {}
  }, [tickets]);

  // Create new ticket function
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFrom.trim() || !formTo.trim()) return;

    const ticketNumber = Math.floor(10000000 + Math.random() * 90000000).toString().substring(0, 8);
    const today = new Date();
    const dateFormatted = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear().toString().slice(-2)}`;
    const timeFormatted = today.toLocaleTimeString('en-GB', { hour12: false });
    const generatedTxn = `GSDQR${Math.floor(1000000 + Math.random() * 9000000)}`;

    const newTicket: TicketData = {
      id: `custom-tkt-${Date.now()}`,
      depotName: `${formFrom.trim().toUpperCase()} DEPOT`,
      ticketNo: ticketNumber,
      date: dateFormatted,
      time: timeFormatted,
      busServiceCode: `${formBusType.toUpperCase()} GJ${Math.floor(10 + Math.random() * 89)}Z${Math.floor(1000 + Math.random() * 8999)}`,
      ticketTypeBanner: '** PASSENGER TICKET (QT) **',
      fromLocation: formFrom.trim().toUpperCase(),
      toLocation: formTo.trim().toUpperCase(),
      totalDistanceKms: `${(Math.random() * 150 + 20).toFixed(2)} KMs`,
      gstAmount: Number((formFare * 0.05).toFixed(1)),
      baseFare: Number((formFare * 0.95).toFixed(2)),
      tollFare: 0.00,
      insFare: 0.00,
      hrFare: 0.00,
      passengerCountText: `FULL : 1 x ${formFare}.0 = ₹ ${formFare}.00`,
      fare: Number(formFare) || 42.00,
      txnNo: generatedTxn,
      busRegNo: `GJ-${Math.floor(10 + Math.random() * 89)}-JT-${Math.floor(1000 + Math.random() * 8999)}`,
      driverInfo: `${Math.floor(100 + Math.random() * 800)} DRIVER: 0`,
      machineSerialNo: `S/N:OTPLP${Math.floor(1000000000000 + Math.random() * 9000000000000)} V2.0`,
      passengerName: formPassenger.trim() || 'મુસાફર',
      seatNo: formSeat.trim() || 'OPEN SEATING',
      status: 'CONFIRMED',
      isCustom: true
    };

    setTickets([newTicket, ...tickets]);
    setShowTicketModal(false);
    
    // Show toast notification
    setTicketCopiedToast(`🎟️ થર્મલ ટિકિટ TXN: ${generatedTxn} જનરેટ થઈ ગઈ!`);
    setTimeout(() => setTicketCopiedToast(null), 4000);
  };

  // Quick Create Ticket helper function
  const handleQuickAddTicket = (fromLoc: string, toLoc: string, busClass: string, fareVal: number) => {
    const ticketNumber = Math.floor(10000000 + Math.random() * 90000000).toString().substring(0, 8);
    const today = new Date();
    const dateFormatted = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear().toString().slice(-2)}`;
    const timeFormatted = today.toLocaleTimeString('en-GB', { hour12: false });
    const generatedTxn = `GSDQR${Math.floor(1000000 + Math.random() * 9000000)}`;

    const newTicket: TicketData = {
      id: `quick-tkt-${Date.now()}`,
      depotName: `${fromLoc.toUpperCase()} DEPOT`,
      ticketNo: ticketNumber,
      date: dateFormatted,
      time: timeFormatted,
      busServiceCode: `${busClass.toUpperCase()} GJ${Math.floor(10 + Math.random() * 89)}Z${Math.floor(1000 + Math.random() * 8999)}`,
      ticketTypeBanner: `** PASSENGER TICKET (${busClass.toUpperCase()}) **`,
      fromLocation: fromLoc.toUpperCase(),
      toLocation: toLoc.toUpperCase(),
      totalDistanceKms: `${(Math.random() * 120 + 60).toFixed(1)} KMs`,
      gstAmount: Number((fareVal * 0.05).toFixed(1)),
      baseFare: Number((fareVal * 0.95).toFixed(2)),
      tollFare: 10.0,
      insFare: 1.0,
      hrFare: 0.0,
      passengerCountText: `FULL : 1 x ${fareVal}.0 = ₹ ${fareVal}.00`,
      fare: fareVal,
      txnNo: generatedTxn,
      busRegNo: `GJ-${Math.floor(10 + Math.random() * 89)}-JT-${Math.floor(1000 + Math.random() * 8999)}`,
      driverInfo: `${Math.floor(100 + Math.random() * 800)} DRIVER: 0`,
      machineSerialNo: `S/N:OTPLP${Math.floor(1000000000000 + Math.random() * 9000000000000)} V2.4`,
      passengerName: 'મુસાફર',
      seatNo: 'OPEN SEATING',
      status: 'CONFIRMED',
      isCustom: true
    };

    setTickets([newTicket, ...tickets]);
    setTicketCopiedToast(`🎟️ ટિકિટ ${fromLoc} ➔ ${toLoc} જનરેટ થઈ ગઈ!`);
    setTimeout(() => setTicketCopiedToast(null), 4000);
  };

  // Copy PNR/TXN to Clipboard
  const handleCopyPNR = (pnr: string) => {
    try {
      navigator.clipboard.writeText(pnr);
    } catch {}
    setTicketCopiedToast(`📋 TXN / PNR ${pnr} કોપી થયો!`);
    setTimeout(() => setTicketCopiedToast(null), 3000);
  };

  // Print Thermal Ticket function
  const handlePrintTicket = (ticket: TicketData) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>GSRTC Thermal Ticket - ${ticket.txnNo}</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; background: #fff; }
              img { width: 100% !important; max-width: 320px; page-break-inside: avoid; }
            }
            body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; background: #111; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
            .ticket-card { background: #222; border: 1px solid #444; padding: 16px; border-radius: 16px; text-align: center; max-width: 340px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            img { width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
            .info { margin-top: 12px; font-size: 14px; font-weight: bold; color: #fde047; }
            .sub-info { font-size: 12px; color: #ccc; margin-top: 4px; }
            .btn { margin-top: 16px; padding: 10px 20px; background: #9e2a2b; color: #fff; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="ticket-card">
            <img src="/ticket1.jpg" alt="GSRTC Thermal Ticket" />
            <div class="info">TXN NO: ${ticket.txnNo}</div>
            <div class="sub-info">${ticket.fromLocation} ➔ ${ticket.toLocation} | ₹${ticket.fare}</div>
            <button class="btn" onclick="window.print()">પ્રિન્ટ કરો (Print Ticket)</button>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Delete Custom Ticket
  const handleDeleteTicket = (id: string) => {
    setTickets(prev => prev.filter(t => t.id !== id));
  };

  // Auto transition background slides
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % bgSlides.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, [bgSlides.length]);

  // --- YouTube Music Player Integration States ---
  const defaultPlaylistItems = [
    {
      id: "dQw4w9WgXcQ",
      title: "તાડી પાડો તો મારા રામની (તાડી પદો રામની - પરસોત્તમ ઉપાધ્યાય)",
      author: "પરષોત્તમ ઉપાધ્યાય & પ્રફુલ્લ દવે",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
    },
    {
      id: "jNQXAC9IVRw",
      title: "મારે ટોડલે બેઠો રે મોર બોલે (કીર્તિદાન ગઢવી રિમિક્સ)",
      author: "કીર્તિદાન ગઢવી",
      thumbnail: "https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg"
    },
    {
      id: "3JZ_D3ELwOQ",
      title: "હે રંગલો જામ્યો કાળિંદીને ઘાટે (ગરબા નોસ્ટાલ્જિયા)",
      author: "પ્રફુલ્લ દવે",
      thumbnail: "https://img.youtube.com/vi/3JZ_D3ELwOQ/hqdefault.jpg"
    },
    {
      id: "L_LUpnjgPso",
      title: "સોના નવરંગ નાળિયેર ઝીલજો રે (ગૂર્જરનગરી લોકગીત)",
      author: "અલ્પા પટેલ",
      thumbnail: "https://img.youtube.com/vi/L_LUpnjgPso/hqdefault.jpg"
    },
    {
      id: "fJ9rUzIMcDQ",
      title: "રાધા ને શ્યામ મળી જશે (સચિન-જીગર - લવ સફર)",
      author: "સચિન જીગર & આઇશ્વર્યા મજમુદાર",
      thumbnail: "https://img.youtube.com/vi/fJ9rUzIMcDQ/hqdefault.jpg"
    },
    {
      id: "OPf0YbXqDm0",
      title: "ઓઢણી ઓઢી ને નાચી આજે મારો કાનુડો",
      author: "ગીતા રબારી",
      thumbnail: "https://img.youtube.com/vi/OPf0YbXqDm0/hqdefault.jpg"
    },
    {
      id: "kJQP7kiw5Fk",
      title: "ચારોતર નો ચાર્મિંગ છોરો (વિક્રમ ઠાકોર હિટ્સ)",
      author: "વિક્રમ ઠાકોર",
      thumbnail: "https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg"
    },
    {
      id: "YQHsXMglC9A",
      title: "નગર મેં જોગી આયા (પાર્થિવ ગોહિલ લાઈવ)",
      author: "પાર્થિવ ગોહિલ",
      thumbnail: "https://img.youtube.com/vi/YQHsXMglC9A/hqdefault.jpg"
    }
  ];

  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trackTitle, setTrackTitle] = useState('2000s Gujarat Bus Nostalgia Playlist');
  const [trackAuthor, setTrackAuthor] = useState('');
  const [trackThumbnail, setTrackThumbnail] = useState<string | null>(null);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [playlistTotal, setPlaylistTotal] = useState(8);
  const [showPlaylistInfo, setShowPlaylistInfo] = useState(false);
  const [playlistVideoIds, setPlaylistVideoIds] = useState<string[]>([]);
  const [playlistTracks, setPlaylistTracks] = useState<Array<{ id: string; title: string; author?: string; thumbnail: string }>>(defaultPlaylistItems);

  // Change background slide automatically when song/track changes
  const prevTrackTitleRef = useRef<string>('');
  useEffect(() => {
    if (trackTitle && prevTrackTitleRef.current && trackTitle !== prevTrackTitleRef.current) {
      setCurrentBgIndex((prev) => (prev + 1) % bgSlides.length);
    }
    if (trackTitle) {
      prevTrackTitleRef.current = trackTitle;
    }
  }, [trackTitle, bgSlides.length]);

  // Bus Interaction States
  const [isBusEngineRunning, setIsBusEngineRunning] = useState(false);
  const [areHeadlightsOn, setAreHeadlightsOn] = useState(false);
  const [showJourneyToast, setShowJourneyToast] = useState(false);
  const [showHornToast, setShowHornToast] = useState(false);
  const [destinationIndex, setDestinationIndex] = useState(0);

  // Rotating Quotes State
  const quotes = [
    "બારીની સીટ એટલે પોતાની દુનિયા.",
    "એ બસનો હોર્ન આજે પણ યાદ છે.",
    "એક ટિકિટ, એક સફર, કેટલીય યાદો.",
    "ગંતવ્ય કરતાં સફર વધારે યાદ રહી ગઈ."
  ];
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Gujarati Destinations for bus destination board
  const destinations = [
    "અમદાવાદ ➔ રાજકોટ",
    "વડોદરા ➔ સુરત",
    "જૂનાગઢ ➔ સોમનાથ",
    "ભાવનગર ➔ ભુજ",
    "જામનગર ➔ દ્વારકા"
  ];

  // Refs
  const playerRef = useRef<any>(null);

  // Web Audio API & Concert-Style EQ Visualizer
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodesMapRef = useRef<Map<HTMLMediaElement, MediaElementAudioSourceNode>>(new Map());
  const animFrameRef = useRef<number | null>(null);

  const [eqHeights, setEqHeights] = useState<number[]>([30, 60, 45, 75]);
  const smoothedHeightsRef = useRef<number[]>([15, 15, 15, 15]);

  // Helper to get or create AudioContext safely with autoplay restriction handling
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  };

  // Connect MediaElement safely ensuring only 1 MediaElementAudioSourceNode per element
  const connectMediaElement = (element: HTMLMediaElement) => {
    if (!element) return;
    try {
      const ctx = getAudioContext();
      if (!analyserRef.current) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64; // 32 frequency bins
        analyser.smoothingTimeConstant = 0.75;
        analyserRef.current = analyser;
        analyser.connect(ctx.destination);
      }

      if (!sourceNodesMapRef.current.has(element)) {
        const source = ctx.createMediaElementSource(element);
        source.connect(analyserRef.current);
        sourceNodesMapRef.current.set(element, source);
      }
    } catch {
      // Prevent duplicate connection or cross-origin errors gracefully
    }
  };

  // Real-time concert-style EQ Animation Loop using requestAnimationFrame
  useEffect(() => {
    let isSubscribed = true;

    const updateEQ = () => {
      if (!isSubscribed) return;

      if (isPlaying) {
        // Handle browser autoplay policy
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume().catch(() => {});
        }

        // Connect any audio or video elements in DOM without duplicating source nodes
        const mediaEls = document.querySelectorAll<HTMLMediaElement>('audio, video');
        mediaEls.forEach((el) => connectMediaElement(el));

        if (analyserRef.current) {
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyserRef.current.getByteFrequencyData(dataArray);

          // Calculate bass, low-mids, high-mids, treble bands
          let bassSum = 0;
          for (let i = 0; i <= 3; i++) bassSum += dataArray[i] || 0;
          const bassAvg = (bassSum / 4) / 255;

          let lowMidSum = 0;
          for (let i = 4; i <= 9; i++) lowMidSum += dataArray[i] || 0;
          const lowMidAvg = (lowMidSum / 6) / 255;

          let highMidSum = 0;
          for (let i = 10; i <= 18; i++) highMidSum += dataArray[i] || 0;
          const highMidAvg = (highMidSum / 9) / 255;

          let trebleSum = 0;
          for (let i = 19; i < bufferLength; i++) trebleSum += dataArray[i] || 0;
          const trebleAvg = (trebleSum / (bufferLength - 19)) / 255;

          // Bass reacts stronger (boost factor 1.45), Highs react faster
          const targetBass = Math.min(100, Math.max(15, bassAvg * 145));
          const targetLowMid = Math.min(100, Math.max(15, lowMidAvg * 125));
          const targetHighMid = Math.min(100, Math.max(15, highMidAvg * 118));
          const targetTreble = Math.min(100, Math.max(15, trebleAvg * 135));

          const targets = [targetBass, targetLowMid, targetHighMid, targetTreble];
          const lerpFactors = [0.25, 0.35, 0.40, 0.45];

          const newHeights = smoothedHeightsRef.current.map((curr, idx) => {
            return curr + (targets[idx] - curr) * lerpFactors[idx];
          });

          smoothedHeightsRef.current = newHeights;
          setEqHeights(newHeights);
        } else {
          // Dynamic music-wave fallback while analyser initializes
          const time = Date.now() / 150;
          const fallbackHeights = [
            Math.abs(Math.sin(time)) * 60 + 20,
            Math.abs(Math.sin(time + 1)) * 75 + 15,
            Math.abs(Math.sin(time + 2)) * 65 + 20,
            Math.abs(Math.sin(time + 3)) * 80 + 15,
          ];
          smoothedHeightsRef.current = fallbackHeights;
          setEqHeights(fallbackHeights);
        }
      } else {
        // Smooth decay when music is paused
        const newHeights = smoothedHeightsRef.current.map((curr) => Math.max(10, curr * 0.85));
        smoothedHeightsRef.current = newHeights;
        setEqHeights(newHeights);
      }

      animFrameRef.current = requestAnimationFrame(updateEQ);
    };

    animFrameRef.current = requestAnimationFrame(updateEQ);

    return () => {
      isSubscribed = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying]);

  // --- Initialize YouTube IFrame API ---
  useEffect(() => {
    // Function to initialize the YT player
    const initPlayer = () => {
      if (playerRef.current) return; // Already initialized

      playerRef.current = new window.YT.Player('yt-hidden-player', {
        height: '1',
        width: '1',
        playerVars: {
          listType: 'playlist',
          list: 'PLToWc4nGUm7o',
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            setIsPlayerReady(true);
            try {
              if (event.target.getVolume) {
                setVolume(event.target.getVolume());
              }
              const playlist = event.target.getPlaylist();
              if (playlist && Array.isArray(playlist)) {
                setPlaylistTotal(playlist.length);
              }
            } catch {
              // Ignore initial query errors
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState: UNSTARTED (-1), ENDED (0), PLAYING (1), PAUSED (2), BUFFERING (3), CUED (5)
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              updateTrackDetails();
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.BUFFERING) {
              updateTrackDetails();
            }
          }
        }
      });
    };

    // Load YouTube IFrame API script dynamically if not present
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const existingScript = document.getElementById('yt-iframe-api-script');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();
        initPlayer();
      };
    }
  }, []);

  // Update track details from YT Player
  const updateTrackDetails = () => {
    if (!playerRef.current) return;
    try {
      if (playerRef.current.getVideoData) {
        const videoData = playerRef.current.getVideoData();
        if (videoData) {
          if (videoData.title) setTrackTitle(videoData.title);
          if (videoData.author) setTrackAuthor(videoData.author);
          const vId = videoData.video_id || videoData.videoId;
          if (vId) {
            setTrackThumbnail(`https://img.youtube.com/vi/${vId}/hqdefault.jpg`);
          }
        }
      }
      if (playerRef.current.getDuration) {
        const dur = playerRef.current.getDuration();
        if (dur) setDuration(dur);
      }
      if (playerRef.current.getPlaylistIndex) {
        const idx = playerRef.current.getPlaylistIndex();
        if (typeof idx === 'number') setPlaylistIndex(idx);
      }
      if (playerRef.current.getPlaylist) {
        const list = playerRef.current.getPlaylist();
        if (list && Array.isArray(list) && list.length > 0) {
          setPlaylistTotal(list.length);
          if (list.join(',') !== playlistVideoIds.join(',')) {
            setPlaylistVideoIds(list);
          }
        }
      }
    } catch {
      // Safely catch cross-origin/unready errors
    }
  };

  // Sync playlist tracks when playlistVideoIds updates
  useEffect(() => {
    if (playlistVideoIds.length === 0) return;

    const newTracks = playlistVideoIds.map((id, index) => {
      const existing = defaultPlaylistItems[index];
      return {
        id,
        title: existing ? existing.title : `ગૂર્જરનગરી સફર ગીત #${index + 1}`,
        author: existing ? existing.author : 'GSRTC Nostalgia',
        thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
      };
    });
    setPlaylistTracks(newTracks);

    playlistVideoIds.forEach((id, index) => {
      fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.title) {
            setPlaylistTracks((prev) => {
              const updated = [...prev];
              if (updated[index]) {
                updated[index] = {
                  ...updated[index],
                  title: data.title,
                  author: data.author_name || updated[index].author
                };
              }
              return updated;
            });
          }
        })
        .catch(() => {});
    });
  }, [playlistVideoIds]);

  const playTrackAtIndex = (index: number) => {
    if (!playerRef.current || !isPlayerReady) return;
    try {
      playerRef.current.playVideoAt(index);
      setPlaylistIndex(index);
      setIsPlaying(true);
      setTimeout(updateTrackDetails, 400);
    } catch (e) {
      console.log("Error playing track at index", index, e);
    }
  };

  // Timer to sync current time and duration periodically
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        if (playerRef.current) {
          try {
            if (playerRef.current.getCurrentTime) {
              setCurrentTime(playerRef.current.getCurrentTime() || 0);
            }
            if (playerRef.current.getDuration) {
              const dur = playerRef.current.getDuration();
              if (dur && dur !== duration) setDuration(dur);
            }
            updateTrackDetails();
          } catch {
            // Ignore temporary player polling errors
          }
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  // --- YouTube Control Handlers ---
  const togglePlay = () => {
    if (!playerRef.current || !isPlayerReady) return;
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    } catch {
      // Fallback
    }
  };

  const handleNextTrack = () => {
    if (!playerRef.current || !isPlayerReady) return;
    try {
      playerRef.current.nextVideo();
      setCurrentBgIndex((prev) => (prev + 1) % bgSlides.length);
      setTimeout(updateTrackDetails, 500);
    } catch {
      // Fallback
    }
  };

  const handlePrevTrack = () => {
    if (!playerRef.current || !isPlayerReady) return;
    try {
      playerRef.current.previousVideo();
      setCurrentBgIndex((prev) => (prev - 1 + bgSlides.length) % bgSlides.length);
      setTimeout(updateTrackDetails, 500);
    } catch {
      // Fallback
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !isPlayerReady || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    setCurrentTime(newTime);
    try {
      playerRef.current.seekTo(newTime, true);
    } catch {
      // Fallback
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseInt(e.target.value, 10);
    setVolume(newVol);
    if (playerRef.current && playerRef.current.setVolume) {
      try {
        playerRef.current.setVolume(newVol);
        if (newVol === 0) {
          playerRef.current.mute();
          setIsMuted(true);
        } else if (isMuted) {
          playerRef.current.unMute();
          setIsMuted(false);
        }
      } catch {
        // Fallback
      }
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume || 50);
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch {
      setIsMuted(!isMuted);
    }
  };

  // Helper: Format seconds to M:SS
  const formatTime = (timeInSeconds: number) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Real-time Top Bar Clock State
  const [formattedTime, setFormattedTime] = useState<string>('');
  const [isAnnouncementPlaying, setIsAnnouncementPlaying] = useState<boolean>(false);
  const announcementAudioRef = useRef<HTMLAudioElement | null>(null);
  const hornAudioRef = useRef<HTMLAudioElement | null>(null);

  const playAnnouncement = () => {
    try {
      if (announcementAudioRef.current) {
        announcementAudioRef.current.pause();
        announcementAudioRef.current.currentTime = 0;
      }
      const audio = new Audio(announcementUrl);
      announcementAudioRef.current = audio;
      audio.volume = 1.0;
      
      setIsAnnouncementPlaying(true);

      audio.play().then(() => {
        // Playing started
      }).catch(() => {
        setIsAnnouncementPlaying(false);
      });

      audio.onended = () => {
        setIsAnnouncementPlaying(false);
      };
    } catch {
      setIsAnnouncementPlaying(false);
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setFormattedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  // --- Auto-rotating quote effect ---
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 4500);
    return () => clearInterval(quoteInterval);
  }, [quotes.length]);

  // --- Web Audio & Audio File: Bus Horn MP3 ---
  const playBusSoundEffects = () => {
    // Show visual toast notification
    setShowHornToast(true);
    setTimeout(() => setShowHornToast(false), 2200);

    try {
      if (hornAudioRef.current) {
        hornAudioRef.current.currentTime = 0;
        hornAudioRef.current.volume = 1.0;
        const promise = hornAudioRef.current.play();
        if (promise !== undefined) {
          promise.catch((err) => {
            console.log("Preloaded audio play error, falling back to new Audio:", err);
            const a = new Audio(hornSoundUrl);
            a.volume = 1.0;
            a.play().catch((e) => console.log("New Audio failed:", e));
          });
        }
      } else {
        const a = new Audio(hornSoundUrl);
        a.volume = 1.0;
        a.play().catch((e) => console.log("Direct Audio failed:", e));
      }
    } catch (e) {
      console.log("playBusSoundEffects error:", e);
    }
  };

  // --- Bus Click Handler ---
  const handleBusClick = () => {
    // Shake bus
    setIsBusEngineRunning(true);
    // Turn on headlights beam
    setAreHeadlightsOn(true);
    // Play audio
    playBusSoundEffects();
    // Show Toast
    setShowJourneyToast(true);

    // Rotate destination board
    setDestinationIndex((prev) => (prev + 1) % destinations.length);

    // Reset shake after 1.2s
    setTimeout(() => {
      setIsBusEngineRunning(false);
    }, 1200);

    // Hide toast after 3.5s
    setTimeout(() => {
      setShowJourneyToast(false);
    }, 3800);
  };

  return (
    <div className="relative min-h-screen bg-[#1C1917] text-[#FDF8EE] font-gujarati overflow-x-hidden selection:bg-[#9E2A2B] selection:text-[#FDF8EE] film-grain">
      
      {/* VISUALLY HIDDEN YOUTUBE IFRAME CONTAINER (AUDIO ONLY) */}
      <div 
        className="fixed top-0 left-0 w-1 h-1 opacity-0 pointer-events-none overflow-hidden z-[-1]"
        aria-hidden="true"
      >
        <div id="yt-hidden-player" />
      </div>

      {/* TOP NAVBAR WITH LIVE TIME ON TOP AND HORN ON RIGHT */}
      <header className="fixed top-0 inset-x-0 z-40 px-4 sm:px-6 py-3 bg-transparent flex items-center justify-between pointer-events-none [&>*]:pointer-events-auto">
        {/* TOP LEFT: LIVE CLOCK (iOS Glass Style) */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/20 backdrop-blur-2xl backdrop-saturate-150 rounded-full border border-white/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.25),inset_0_1px_1px_0_rgba(255,255,255,0.4)] transition-all">
          <Clock className="w-4 h-4 text-[#FDE047] animate-pulse drop-shadow" />
          <span className="text-xs sm:text-sm font-mono font-bold text-[#FDF8EE] tracking-wider drop-shadow-sm">
            {formattedTime || '12:00:00 PM'}
          </span>
        </div>

        {/* TOP RIGHT: ANNOUNCEMENT & HORN BUTTONS (iOS Glass Style) */}
        <div className="flex items-center gap-2">
          {/* Announcement Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={playAnnouncement}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full backdrop-blur-2xl backdrop-saturate-150 border border-white/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.3),inset_0_1px_1px_0_rgba(255,255,255,0.4)] font-gujarati text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              isAnnouncementPlaying 
                ? 'bg-[#FDE047] text-[#1C1917] border-[#FDE047] shadow-[0_0_20px_rgba(253,224,71,0.6)] animate-pulse' 
                : 'bg-[#9E2A2B]/60 hover:bg-[#9E2A2B]/80 text-[#FDF8EE]'
            }`}
            title="એનાઉન્સમેન્ટ સાંભળો (Bus Announcement)"
          >
            <Megaphone className={`w-4 h-4 ${isAnnouncementPlaying ? 'text-[#1C1917]' : 'text-[#FDE047]'} drop-shadow`} />
            <span className="drop-shadow-sm">એનાઉન્સમેન્ટ</span>
          </motion.button>

          {/* Horn Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={playBusSoundEffects}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full backdrop-blur-2xl backdrop-saturate-150 border border-white/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.3),inset_0_1px_1px_0_rgba(255,255,255,0.4)] font-gujarati text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              showHornToast
                ? 'bg-[#FDE047] text-[#1C1917] border-[#FDE047] scale-105 shadow-[0_0_20px_rgba(253,224,71,0.6)]'
                : 'bg-[#9E2A2B]/60 hover:bg-[#9E2A2B]/80 text-[#FDF8EE]'
            }`}
            title="હોર્ન વગાડો (Blow Horn)"
          >
            <HornIcon className={`w-4 h-4 ${showHornToast ? 'brightness-100 invert-0' : 'text-[#FDE047]'} drop-shadow`} />
            <span className="drop-shadow-sm">હોર્ન</span>
          </motion.button>
        </div>
      </header>

      {/* TICKET TOAST NOTIFICATION */}
      <AnimatePresence>
        {ticketCopiedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1C1917]/85 backdrop-blur-3xl backdrop-saturate-150 text-[#FDF8EE] px-6 py-3.5 rounded-full shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_0_rgba(255,255,255,0.4)] border border-[#FDE047]/60 flex items-center gap-3 font-semibold font-gujarati"
          >
            <Ticket className="w-5 h-5 text-[#FDE047]" />
            <span className="text-sm md:text-base font-medium tracking-wide drop-shadow text-[#FDF8EE]">
              {ticketCopiedToast}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HORN TOAST NOTIFICATION */}
      <AnimatePresence>
        {showHornToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#9E2A2B]/90 backdrop-blur-3xl backdrop-saturate-150 text-[#FDF8EE] px-6 py-3.5 rounded-full shadow-[0_16px_40px_rgba(158,42,43,0.7),inset_0_1px_1px_0_rgba(255,255,255,0.4)] border border-[#FDE047]/70 flex items-center gap-3 font-semibold"
          >
            <HornIcon className="w-5 h-5 text-[#FDE047] animate-pulse" />
            <span className="text-sm md:text-base font-bold font-gujarati tracking-wide drop-shadow text-[#FDE047]">
              "📯 પંપાણ... પંપાણ! (ગૂર્જરનગરી Express હોર્ન)"
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ANNOUNCEMENT TOAST NOTIFICATION */}
      <AnimatePresence>
        {isAnnouncementPlaying && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1C1917]/85 backdrop-blur-3xl backdrop-saturate-150 text-[#FDF8EE] px-6 py-3.5 rounded-full shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_0_rgba(255,255,255,0.4)] border border-[#FDE047]/60 flex items-center gap-3 font-semibold"
          >
            <Megaphone className="w-5 h-5 text-[#FDE047] animate-bounce" />
            <span className="text-sm md:text-base font-medium font-gujarati tracking-wide drop-shadow text-[#FDE047]">
              "📢 એસ. ટી. બસ એનાઉન્સમેન્ટ વાગી રહ્યું છે..."
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NOSTALGIC TOAST NOTIFICATION ON BUS CLICK */}
      <AnimatePresence>
        {showJourneyToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-white/20 backdrop-blur-3xl backdrop-saturate-150 text-[#FDF8EE] px-6 py-3 rounded-full shadow-[0_16px_40px_rgba(0,0,0,0.4),inset_0_1px_1px_0_rgba(255,255,255,0.5)] border border-white/40 flex items-center gap-3 font-semibold"
          >
            <div className="w-3 h-3 rounded-full bg-[#9E2A2B] animate-ping" />
            <span className="text-lg md:text-xl font-medium tracking-wide drop-shadow">
              "ચાલો... સફર શરૂ કરીએ."
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* SECTION 1: HERO (GURJARNAGARI BUS)          */}
      {/* ========================================== */}
      <section className="relative z-10 min-h-screen flex flex-col justify-between items-center px-4 pt-20 pb-16 overflow-hidden">
        
        {/* BACKGROUND IMAGE SLIDER ONLY IN FIRST COMPONENT */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#1C1917]">
          <AnimatePresence mode="popLayout">
            <motion.img 
              key={currentBgIndex}
              src={bgSlides[currentBgIndex]} 
              alt={`Background slide ${currentBgIndex + 1}`} 
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1.01 }}
              exit={{ opacity: 0, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover object-center contrast-[1.08] saturate-[1.15] brightness-[0.98]"
            />
          </AnimatePresence>

          {/* Golden Sunset Warmth Bloom Overlay */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-t from-[#F59E0B]/25 via-[#DC2626]/15 to-transparent rounded-full blur-3xl mix-blend-screen pointer-events-none" />
          
          {/* Vignette Edge Shading */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_rgba(0,0,0,0.65)_100%)] pointer-events-none" />

          {/* Smooth Fade Transition at Bottom to Match the Rest of the Page */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#1C1917] pointer-events-none" />
        </div>

        {/* TOP BRANDING & TITLES */}
        <div className="relative z-10 text-center mt-4 md:mt-6 max-w-3xl mx-auto space-y-3">
          {/* Large Title */}
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex flex-wrap items-baseline justify-center gap-2 sm:gap-3 text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold font-display tracking-tight text-[#FDF8EE] drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
          >
            <span>ગૂર્જરનગરી</span>
            <span 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black font-sans uppercase tracking-widest text-[#FDE047] bg-[#9E2A2B] border-2 border-[#FDE047] px-3.5 py-1 rounded-md shadow-lg inline-block ml-1 sm:ml-2 align-baseline -rotate-1"
            >
              EXPRESS
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-3 sm:mt-5 text-xl sm:text-2xl md:text-3xl font-medium text-[#FDE047]/90 tracking-wide font-gujarati"
          >
            એ સફર... જે આજે પણ યાદ છે.
          </motion.p>
        </div>



      </section>



      {/* CREATE TICKET MODAL */}
      <AnimatePresence>
        {showTicketModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xl backdrop-saturate-150">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-[#1C1917]/85 backdrop-blur-3xl backdrop-saturate-150 text-[#FDF8EE] rounded-3xl p-6 sm:p-8 border border-white/25 shadow-[0_30px_90px_rgba(0,0,0,0.85),inset_0_1px_1px_0_rgba(255,255,255,0.3)] overflow-hidden font-gujarati"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowTicketModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#FDF8EE] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Title */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-[#9E2A2B] text-[#FDE047] flex items-center justify-center border border-white/20 shadow-md">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display text-[#FDF8EE]">
                    નવી GSRTC ડિજિટલ ટિકિટ
                  </h3>
                  <p className="text-xs text-[#FDE047]/80">
                    તમારી મનપસંદ સફરની વિગતો ઉમેરી ડિજિટલ ટિકિટ બનાવો.
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateTicket} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-[#FDF8EE]/80 mb-1">
                    મુસાફરનું નામ (Passenger Name)
                  </label>
                  <input
                    type="text"
                    required
                    value={formPassenger}
                    onChange={(e) => setFormPassenger(e.target.value)}
                    placeholder="દા.ત. ધ્રુવ વ્યાસ"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-[#FDF8EE] placeholder-white/40 focus:outline-none focus:border-[#FDE047]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#FDF8EE]/80 mb-1">
                      ઉપડવાનું સ્થાન (From)
                    </label>
                    <input
                      type="text"
                      required
                      value={formFrom}
                      onChange={(e) => setFormFrom(e.target.value)}
                      placeholder="અમદાવાદ"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-[#FDF8EE] placeholder-white/40 focus:outline-none focus:border-[#FDE047]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#FDF8EE]/80 mb-1">
                      પહોંચવાનું સ્થાન (To)
                    </label>
                    <input
                      type="text"
                      required
                      value={formTo}
                      onChange={(e) => setFormTo(e.target.value)}
                      placeholder="રાજકોટ"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-[#FDF8EE] placeholder-white/40 focus:outline-none focus:border-[#FDE047]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#FDF8EE]/80 mb-1">
                      બસ પ્રકાર (Bus Class)
                    </label>
                    <select
                      value={formBusType}
                      onChange={(e) => setFormBusType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#282320] border border-white/20 text-[#FDF8EE] focus:outline-none focus:border-[#FDE047]"
                    >
                      <option value="ગૂર્જરનગરી એક્સપ્રેસ">ગૂર્જરનગરી એક્સપ્રેસ</option>
                      <option value="ગૂર્જરનગરી સ્લીપર">ગૂર્જરનગરી સ્લીપર</option>
                      <option value="સુપર એક્સપ્રેસ">સુપર એક્સપ્રેસ</option>
                      <option value="વોલ્વો એસી સર્વિસ">વોલ્વો એસી સર્વિસ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#FDF8EE]/80 mb-1">
                      સીટ નંબર (Seat No)
                    </label>
                    <input
                      type="text"
                      value={formSeat}
                      onChange={(e) => setFormSeat(e.target.value)}
                      placeholder="18B (બારી સીટ)"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-[#FDF8EE] placeholder-white/40 focus:outline-none focus:border-[#FDE047]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#FDF8EE]/80 mb-1">
                      તારીખ (Date)
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-[#FDF8EE] focus:outline-none focus:border-[#FDE047] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#FDF8EE]/80 mb-1">
                      સમય (Time)
                    </label>
                    <input
                      type="text"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      placeholder="09:00 AM"
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-[#FDF8EE] placeholder-white/40 focus:outline-none focus:border-[#FDE047] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#FDF8EE]/80 mb-1">
                      ભાડું (₹ Fare)
                    </label>
                    <input
                      type="number"
                      value={formFare}
                      onChange={(e) => setFormFare(Number(e.target.value))}
                      placeholder="195"
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-[#FDF8EE] placeholder-white/40 focus:outline-none focus:border-[#FDE047] text-xs"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowTicketModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FDF8EE] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    રદ કરો
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#B83234] text-[#FDF8EE] font-bold text-sm shadow-md transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#FDE047]" />
                    <span>જનરેટ કરો</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>




      {/* ========================================== */}
      {/* SECTION 4: FLOATING MUSIC PLAYER WITH QUOTE FLOATING OUTSIDE TOP */}
      {/* ========================================== */}
      <div 
        style={{ marginTop: '0px', marginBottom: '10px' }}
        className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-2xl z-50 flex flex-col items-center gap-2 pointer-events-none"
      >
        {/* ROTATING QUOTE FLOATING OUTSIDE ABOVE MUSIC PLAYER WITH GLASS EFFECT */}
        <div className="pointer-events-auto max-w-xl px-5 py-2 bg-black/35 dark:bg-[#1C1917]/45 backdrop-blur-3xl backdrop-saturate-150 rounded-full border border-white/30 shadow-[0_12px_32px_0_rgba(0,0,0,0.4),inset_0_1px_1px_0_rgba(255,255,255,0.4)] text-center transition-all">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuoteIndex}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold font-display text-[#FDF8EE] tracking-wide font-gujarati drop-shadow"
            >
              <span className="text-[#FDE047] text-sm font-serif">“</span>
              <span className="truncate max-w-full">{quotes[currentQuoteIndex]}</span>
              <span className="text-[#FDE047] text-sm font-serif">”</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* MUSIC PLAYER CONTAINER WITH GLASS EFFECT */}
        <div className={`pointer-events-auto w-full p-2.5 sm:p-3.5 bg-black/45 dark:bg-[#1C1917]/60 backdrop-blur-3xl backdrop-saturate-150 transition-all border border-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.65),inset_0_1px_1px_0_rgba(255,255,255,0.35)] ${showPlaylistInfo ? 'rounded-2xl sm:rounded-3xl' : 'rounded-2xl sm:rounded-full'}`}>
          
          {/* Progress bar integrated into top border */}
          <div 
            onClick={handleSeek}
            className="relative mx-2 mb-2 h-1 bg-white/15 rounded-full overflow-hidden cursor-pointer group"
            title="Seek track"
          >
            <div 
              className="h-full bg-gradient-to-r from-[#9E2A2B] to-[#FDE047] rounded-full transition-all duration-200"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

        {/* PLAYLIST INFO EXPANDABLE DRAWER */}
        <AnimatePresence>
          {showPlaylistInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-2 sm:px-3 pb-3 mb-2.5 border-b border-white/20 overflow-hidden text-xs"
            >
              {/* Playlist Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 font-gujarati">
                <div className="flex items-center gap-2">
                  <img 
                    src="https://img.icons8.com/?size=100&id=V1cbDThDpbRc&format=png&color=ffffff" 
                    alt="YouTube Music" 
                    className="w-5 h-5 object-contain drop-shadow"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#FDF8EE] flex items-center gap-2">
                      <span>ગૂર્જરનગરી Express પ્લેલિસ્ટ</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FDE047]/20 border border-[#FDE047]/40 text-[#FDE047] font-mono">
                        {playlistTracks.length} ગીતો
                      </span>
                    </h4>
                    <p className="text-[10px] text-[#FDF8EE]/70 font-mono">2000s Gujarat Bus Nostalgia Songs</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a 
                    href="https://music.youtube.com/playlist?list=PLToWc4nGUm7o&si=bYIb_fJmmhhwQ016" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[#FDF8EE] hover:text-[#FDE047] transition-all flex items-center gap-1.5 font-bold text-[11px] border border-white/20"
                    title="YouTube Music પર પ્લેલિસ્ટ જુઓ"
                  >
                    <img 
                      src="https://img.icons8.com/?size=100&id=V1cbDThDpbRc&format=png&color=ffffff" 
                      alt="YouTube Music" 
                      className="w-4 h-4 object-contain drop-shadow"
                      referrerPolicy="no-referrer"
                    />
                    <span>YT Music</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => setShowPlaylistInfo(false)}
                    className="p-1 rounded-full hover:bg-white/20 text-[#FDF8EE]/70 hover:text-[#FDF8EE] transition-colors"
                    title="Close Playlist"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Playlist Track Items */}
              <div className="max-h-48 sm:max-h-56 overflow-y-auto space-y-1.5 pr-1 font-gujarati custom-scrollbar">
                {playlistTracks.map((track, idx) => {
                  const isActive = idx === playlistIndex;
                  return (
                    <div
                      key={track.id || idx}
                      onClick={() => playTrackAtIndex(idx)}
                      className={`group flex items-center justify-between gap-2.5 p-2 rounded-xl cursor-pointer transition-all border ${
                        isActive
                          ? 'bg-[#FDE047]/20 border-[#FDE047]/50 text-[#FDE047] shadow-[0_4px_16px_rgba(253,224,71,0.2)]'
                          : 'bg-white/5 hover:bg-white/15 border-white/10 text-[#FDF8EE] hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {/* Track Number / Equalizer */}
                        <div className="w-5 text-center flex-shrink-0 flex items-center justify-center font-mono text-xs">
                          {isActive && isPlaying ? (
                            <div className="flex items-end gap-0.5 h-3.5">
                              <span 
                                className="w-0.5 bg-[#FDE047] rounded-full transition-all duration-75"
                                style={{ height: `${eqHeights[0]}%` }}
                              />
                              <span 
                                className="w-0.5 bg-[#FDE047] rounded-full transition-all duration-75"
                                style={{ height: `${eqHeights[1]}%` }}
                              />
                              <span 
                                className="w-0.5 bg-[#FDE047] rounded-full transition-all duration-75"
                                style={{ height: `${eqHeights[2]}%` }}
                              />
                              <span 
                                className="w-0.5 bg-[#FDE047] rounded-full transition-all duration-75"
                                style={{ height: `${eqHeights[3]}%` }}
                              />
                            </div>
                          ) : (
                            <span className={isActive ? 'text-[#FDE047] font-bold' : 'text-[#FDF8EE]/50'}>
                              {idx + 1}
                            </span>
                          )}
                        </div>

                        {/* Thumbnail */}
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-white/20 flex-shrink-0 bg-black/40">
                          <img 
                            src={track.thumbnail} 
                            alt={track.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/bus.png';
                            }}
                          />
                          <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            {isActive && isPlaying ? (
                              <Pause className="w-4 h-4 fill-current text-[#FDE047]" />
                            ) : (
                              <Play className="w-4 h-4 fill-current text-[#FDF8EE]" />
                            )}
                          </div>
                        </div>

                        {/* Song Title & Author */}
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs sm:text-sm font-bold truncate leading-tight ${isActive ? 'text-[#FDE047]' : 'text-[#FDF8EE]'}`}>
                            {track.title}
                          </p>
                          <p className="text-[10px] sm:text-xs text-[#FDF8EE]/70 truncate font-mono mt-0.5">
                            {track.author || 'ગૂર્જરનગરી Express સફર'}
                          </p>
                        </div>
                      </div>

                      {/* Status / Play Action */}
                      <div className="flex-shrink-0">
                        {isActive ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FDE047] text-[#1C1917] shadow-sm">
                            {isPlaying ? 'વાગે છે' : 'અટકેલું'}
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playTrackAtIndex(idx);
                            }}
                            className="p-1.5 rounded-full bg-white/10 hover:bg-[#9E2A2B] text-[#FDF8EE] transition-colors"
                            title="પ્લે કરો"
                          >
                            <Play className="w-3 h-3 fill-current" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* COMPACT SINGLE-ROW PLAYER CONTROLS */}
        <div className="flex items-center justify-between gap-2.5 px-1 sm:px-2">
          
          {/* Track Info (Artwork + Title + Time) */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div 
              onClick={togglePlay}
              className="relative group cursor-pointer flex-shrink-0"
              title={isPlaying ? "Pause" : "Play"}
            >
              {trackThumbnail ? (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-white/30 shadow-md bg-[#261D1A]">
                  <img 
                    src={trackThumbnail} 
                    alt={trackTitle} 
                    className={`w-full h-full object-cover transition-transform ${isPlaying ? 'animate-spin-slow' : ''}`}
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 backdrop-blur-xl flex items-center justify-center text-[#FDF8EE] border border-white/30">
                  <Radio className={`w-4 h-4 ${isPlaying ? 'animate-pulse text-[#FDE047]' : ''}`} />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-bold text-[#FDF8EE] truncate font-gujarati tracking-wide leading-tight">
                {trackTitle}
              </p>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-[#FDF8EE]/70 font-mono mt-0.5">
                <span className="truncate">{trackAuthor || 'ગૂર્જરનગરી Express'}</span>
                <span>•</span>
                <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {/* Previous */}
            <button
              onClick={handlePrevTrack}
              disabled={!isPlayerReady}
              className="p-1.5 sm:p-2 text-[#FDF8EE] hover:text-[#FDE047] disabled:opacity-40 hover:bg-white/10 active:scale-90 rounded-full transition-all"
              title="અગાઉનું ગીત"
              aria-label="Previous Track"
            >
              <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Play / Pause Button */}
            <button
              onClick={togglePlay}
              disabled={!isPlayerReady}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#9E2A2B] hover:bg-[#b53233] active:scale-95 text-[#FDF8EE] flex items-center justify-center transition-all shadow-md border border-white/30"
              title={isPlaying ? "Pause" : "Play"}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current text-[#FDF8EE]" />
              ) : (
                <Play className="w-4 h-4 fill-current text-[#FDF8EE] ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={handleNextTrack}
              disabled={!isPlayerReady}
              className="p-1.5 sm:p-2 text-[#FDF8EE] hover:text-[#FDE047] disabled:opacity-40 hover:bg-white/10 active:scale-90 rounded-full transition-all"
              title="પછીનું ગીત"
              aria-label="Next Track"
            >
              <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>



            {/* Mute Toggle */}
            <button
              onClick={toggleMute}
              className="p-1.5 sm:p-2 text-[#FDF8EE] hover:text-[#FDE047] hover:bg-white/10 rounded-full transition-colors hidden xs:flex"
              title={isMuted ? "Unmute" : "Mute"}
              aria-label="Toggle Mute"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FDE047]" />
              )}
            </button>

            {/* Playlist Info Toggle */}
            <button
              onClick={() => setShowPlaylistInfo(!showPlaylistInfo)}
              className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                showPlaylistInfo ? 'bg-white/20 text-[#FDE047]' : 'text-[#FDF8EE]/80 hover:text-[#FDE047] hover:bg-white/10'
              }`}
              title="Playlist Info"
              aria-label="Playlist Info"
            >
              <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Hidden Audio Elements for Instant Sound Triggering */}
      <audio ref={hornAudioRef} src={hornSoundUrl} preload="auto" className="hidden" />
    </div>
  </div>
  );
}
