export const teacherDashboardMockSchedule = [
  {
    id: 'schedule-bahasa-inggris-xi-diponegoro-senin-1',
    day: 1,
    start: '07:30',
    end: '09:00',
    className: 'XI Pangeran Diponegoro',
    subject: 'Bahasa Inggris',
    room: 'Ruang 11.1',
  },
  {
    id: 'schedule-bahasa-inggris-xi-soeharto-senin-2',
    day: 1,
    start: '10:15',
    end: '11:45',
    className: 'XI Soeharto',
    subject: 'Bahasa Inggris',
    room: 'Ruang 11.2',
  },
  {
    id: 'schedule-bahasa-inggris-xii-sudirman-rabu-1',
    day: 3,
    start: '08:15',
    end: '09:45',
    className: 'XII Jenderal Sudirman',
    subject: 'Bahasa Inggris',
    room: 'Ruang 12.1',
  },
  {
    id: 'schedule-bahasa-inggris-xii-habibie-kamis-1',
    day: 4,
    start: '09:30',
    end: '11:00',
    className: 'XII B.J. Habibie',
    subject: 'Bahasa Inggris',
    room: 'Ruang 12.2',
  },
]

export const teacherDashboardMockAttention = [
  {
    id: 'attention-score-trend-xi-soeharto',
    type: 'nilai',
    title: 'Rata-rata nilai XI Soeharto turun 6 poin',
    meta: 'Bahasa Inggris · perlu cek daftar nilai',
    actionLabel: 'Cek nilai',
    target: '/guru/daftar-nilai',
  },
  {
    id: 'attention-low-attendance-xii-sudirman',
    type: 'siswa',
    title: '3 siswa XII Jenderal Sudirman perlu dipantau',
    meta: 'Kehadiran bulan ini di bawah 85%',
    actionLabel: 'Lihat rekap',
    target: '/guru/daftar-hadir',
  },
]

export const teacherDashboardMockClassMetrics = [
  { className: 'XI Pangeran Diponegoro', average: 86, progress: 74, note: 'Stabil' },
  { className: 'XI Soeharto', average: 81, progress: 68, note: 'Perlu latihan' },
  { className: 'XII Jenderal Sudirman', average: 84, progress: 71, note: 'Siap kuis' },
  { className: 'XII B.J. Habibie', average: 88, progress: 79, note: 'Tuntas' },
]
