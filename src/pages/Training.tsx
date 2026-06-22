import { useEffect, useState } from 'react';
import {
  GraduationCap, Search, Clock, ChevronRight, Play, BookOpen,
  TrendingUp, CheckCircle2, Award, Star,
  Wrench, Network, DollarSign, Headphones, Server, Users,
} from 'lucide-react';
import { getTrainingData } from '../lib/appApi';
import { Card } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Progress } from '../components/ui/progress';
import type { Training, Category } from '../types';

const CATEGORY_ICONS: Record<string, typeof Wrench> = {
  'Suporte Técnico': Wrench,
  'NOC': Network,
  'Comercial': TrendingUp,
  'Financeiro': DollarSign,
  'CSC': Headphones,
  'Infraestrutura': Server,
  'Recursos Humanos': Users,
};

const LEVEL_CONFIG = {
  beginner: { label: 'Iniciante', color: 'bg-emerald-100 text-emerald-700' },
  intermediate: { label: 'Intermediário', color: 'bg-amber-100 text-amber-700' },
  advanced: { label: 'Avançado', color: 'bg-red-100 text-red-700' },
};

interface TrainingWithProgress extends Training {
  _progress: number;
  _completed: boolean;
}

export function Training() {
  const [trainings, setTrainings] = useState<TrainingWithProgress[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedTraining, setSelectedTraining] = useState<TrainingWithProgress | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await getTrainingData();

    setTrainings(
      data.trainings.map((t) => ({
        ...t,
        _progress: Math.floor(Math.random() * 101),
        _completed: Math.random() > 0.6,
      }))
    );
    setCategories(data.categories);
    setLoading(false);
  }

  const stats = {
    total: trainings.length,
    completed: trainings.filter(t => t._completed).length,
    inProgress: trainings.filter(t => t._progress > 0 && !t._completed).length,
    pending: trainings.filter(t => t._progress === 0).length,
  };

  const filtered = trainings.filter(t => {
    const cat = t.categories;
    const matchCat = selectedCategory === 'all' || cat?.name === selectedCategory;
    const matchLevel = selectedLevel === 'all' || t.level === selectedLevel;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchLevel && matchSearch;
  });

  if (selectedTraining) {
    return <TrainingDetail training={selectedTraining} onBack={() => setSelectedTraining(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Treinamentos</h1>
          <p className="text-sm text-slate-500 mt-0.5">Portal de capacitação dos colaboradores</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Concluídos', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Em Progresso', value: stats.inProgress, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Pendentes', value: stats.pending, icon: Clock, color: 'text-slate-600', bg: 'bg-slate-50' },
        ].map(s => (
          <Card key={s.label} className="p-4 border-slate-200">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <s.icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Overall progress */}
      <Card className="p-5 border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-orange-500" />
            <span className="text-sm font-semibold text-slate-800">Seu Progresso Geral</span>
          </div>
          <span className="text-sm font-bold text-orange-600">
            {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
          </span>
        </div>
        <Progress
          value={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}
          className="h-2.5"
        />
        <p className="text-xs text-slate-500 mt-2">
          {stats.completed} de {stats.total} treinamentos concluídos
        </p>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar treinamentos..."
            className="w-full pl-9 pr-4 h-9 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={selectedLevel}
          onChange={e => setSelectedLevel(e.target.value)}
          className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
        >
          <option value="all">Todos os níveis</option>
          <option value="beginner">Iniciante</option>
          <option value="intermediate">Intermediário</option>
          <option value="advanced">Avançado</option>
        </select>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
            selectedCategory === 'all'
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'
          }`}
        >
          <GraduationCap size={11} /> Todos
        </button>
        {categories.map(cat => {
          const Icon = CATEGORY_ICONS[cat.name] || BookOpen;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                selectedCategory === cat.name
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'
              }`}
            >
              <Icon size={11} /> {cat.name}
            </button>
          );
        })}
      </div>

      {/* Training cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-slate-200 overflow-hidden">
                <Skeleton className="h-36 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </Card>
            ))
          : filtered.map(training => {
              const cat = training.categories;
              const levelConf = LEVEL_CONFIG[training.level];
              const Icon = cat?.name ? CATEGORY_ICONS[cat.name] || BookOpen : BookOpen;

              return (
                <Card
                  key={training.id}
                  className="border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                  onClick={() => setSelectedTraining(training)}
                >
                  {/* Thumbnail */}
                  <div
                    className="h-36 flex items-center justify-center relative"
                    style={{ background: `linear-gradient(135deg, ${cat?.color || '#ff7a00'}22, ${cat?.color || '#ff7a00'}44)` }}
                  >
                    <Icon size={48} style={{ color: cat?.color || '#ff7a00' }} className="opacity-70" />
                    {training._completed && (
                      <div className="absolute top-2 right-2">
                        <div className="flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-medium px-2 py-1 rounded-full">
                          <CheckCircle2 size={9} /> Concluído
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200">
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${training._progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
                        {training.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{training.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${levelConf.color}`}>
                        {levelConf.label}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock size={9} /> {training.duration_minutes}min
                      </span>
                      {training._progress > 0 && !training._completed && (
                        <span className="text-[10px] text-orange-600 ml-auto font-medium">{training._progress}%</span>
                      )}
                    </div>
                    <button className="mt-3 w-full flex items-center justify-center gap-2 h-8 rounded-lg text-xs font-semibold transition-colors bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white">
                      <Play size={11} fill="currentColor" />
                      {training._progress > 0 ? 'Continuar' : 'Iniciar Treinamento'}
                    </button>
                  </div>
                </Card>
              );
            })}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <GraduationCap size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Nenhum treinamento encontrado</p>
          <p className="text-slate-400 text-sm mt-1">Tente ajustar os filtros</p>
        </div>
      )}
    </div>
  );
}

function TrainingDetail({ training, onBack }: { training: TrainingWithProgress; onBack: () => void }) {
  const [progress, setProgress] = useState(training._progress);
  const levelConf = LEVEL_CONFIG[training.level];
  const cat = training.categories;

  const checklist = [
    { label: 'Assista ao vídeo introdutório', done: progress >= 25 },
    { label: 'Leia o material complementar', done: progress >= 50 },
    { label: 'Complete os exercícios práticos', done: progress >= 75 },
    { label: 'Faça a avaliação final', done: progress >= 100 },
  ];

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ChevronRight size={14} className="rotate-180" /> Voltar para Treinamentos
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Video player mock */}
          <Card className="border-slate-200 overflow-hidden">
            <div
              className="h-64 flex items-center justify-center relative cursor-pointer group"
              style={{ background: `linear-gradient(135deg, ${cat?.color || '#ff7a00'}22, ${cat?.color || '#ff7a00'}44)` }}
            >
              <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play size={24} className="text-orange-500 ml-1" fill="currentColor" />
              </div>
              <div className="absolute bottom-3 left-3 text-xs text-white bg-black/40 px-2 py-1 rounded">
                {training.duration_minutes}:00
              </div>
            </div>
          </Card>

          <Card className="p-5 border-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-lg font-bold text-slate-800">{training.title}</h1>
                <p className="text-sm text-slate-500 mt-1">{training.description}</p>
              </div>
              <span className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${levelConf.color}`}>
                {levelConf.label}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Clock size={12} /> {training.duration_minutes} minutos</span>
              <span className="flex items-center gap-1"><BookOpen size={12} /> {cat?.name}</span>
              <span className="flex items-center gap-1"><Star size={12} /> 4.8 (24 avaliações)</span>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Progress */}
          <Card className="p-5 border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Seu Progresso</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">Conclusão</span>
              <span className="text-sm font-bold text-orange-600">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2.5 mb-4" />
            {training._completed ? (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                <CheckCircle2 size={14} />
                <span className="text-xs font-medium">Treinamento concluído!</span>
              </div>
            ) : (
              <button
                onClick={() => setProgress(Math.min(100, progress + 25))}
                className="w-full h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Play size={13} fill="currentColor" />
                {progress > 0 ? 'Continuar' : 'Iniciar'}
              </button>
            )}
          </Card>

          {/* Checklist */}
          <Card className="p-5 border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Checklist de Conclusão</h3>
            <ul className="space-y-2.5">
              {checklist.map((item, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center ${item.done ? 'bg-emerald-500' : 'bg-slate-100 border border-slate-300'}`}>
                    {item.done && <CheckCircle2 size={10} className="text-white" />}
                  </div>
                  <span className={`text-xs ${item.done ? 'text-slate-700' : 'text-slate-400'}`}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
            {progress >= 100 && (
              <button className="mt-4 w-full h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                <Award size={14} /> Emitir Certificado
              </button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
