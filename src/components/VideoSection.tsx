import { useState } from 'react';
import { Play, ExternalLink, Loader2 } from 'lucide-react';

interface Props {
  videoUrl: string;
  thumbnailUrl: string;
  docUrl: string;
  docLabel: string;
}

const VideoSection: React.FC<Props> = ({ videoUrl, thumbnailUrl, docUrl, docLabel }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [thumbError, setThumbError] = useState(false);

  const handleLoadVideo = () => {
    setLoading(true);
    setThumbError(false);
    setVideoLoaded(true);
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([^&?/]+)/);
    return match ? match[1] : null;
  };

  // Convertit toute URL YouTube en format embed compatible iframe
  const toEmbedUrl = (url: string): string => {
    const id = extractYouTubeId(url);
    if (id) return `https://www.youtube.com/embed/${id}?rel=0&autoplay=1`;
    return url; // fallback : retourner tel quel
  };

  const youtubeId = extractYouTubeId(videoUrl);
  const embedUrl = toEmbedUrl(videoUrl);

  const ytThumb = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
    : null;

  const activeThumbnail = thumbError ? '/Patrice.jpg' : (thumbnailUrl || ytThumb || '/Patrice.jpg');

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center">
          <Play size={18} className="text-sky-500" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">Vidéo d'introduction</p>
          <p className="text-xs text-gray-500">À regarder avant de répondre à la question 1.</p>
        </div>
      </div>

      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 border border-gray-200 shadow-inner">
        {videoLoaded ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={embedUrl}
            title="Vidéo d'introduction - Activité 1"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={() => setLoading(false)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Thumbnail image */}
            <img
              src={activeThumbnail}
              alt="Miniature vidéo"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
              crossOrigin="anonymous"
              onError={() => {
                setThumbError(true);
              }}
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />

            {/* Play button */}
            <button
              onClick={handleLoadVideo}
              className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group border-2 border-white/40 hover:border-white/60 cursor-pointer"
            >
              {loading ? (
                <Loader2 size={28} className="text-white animate-spin" />
              ) : (
                <Play size={28} className="text-white ml-1 group-hover:scale-110 transition-transform" fill="white" />
              )}
            </button>

            <p className="relative z-10 text-white text-xs sm:text-sm font-medium mt-3 drop-shadow-lg">
              Cliquez pour lire la vidéo
            </p>
          </div>
        )}
      </div>

      {/* Google Doc link */}
      <div className="mt-4 pt-4 border-t border-sky-100">
        <a
          href={docUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-700 underline decoration-sky-300 underline-offset-4 transition-colors"
        >
          {docLabel}
          <ExternalLink size={15} />
        </a>
      </div>
    </div>
  );
};

export default VideoSection;
