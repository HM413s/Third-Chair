
import { motion } from "framer-motion";

interface FeatureContentProps {
  image: string;
  title: string;
  hoverText?: string;
}

export const FeatureContent = ({ image, title, hoverText }: FeatureContentProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full flex items-center justify-center"
    >
      <div className="glass rounded-xl overflow-hidden w-full relative group cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <img
          src={image}
          alt={title}
          className="w-full h-[400px] object-cover relative z-10 image-scale-effect"
        />
        
        {/* Modern Hover Overlay */}
        <div className="image-hover-overlay z-20">
          <div className="image-hover-content">
            <motion.h3 
              className="text-2xl font-bold text-white mb-2"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {title}
            </motion.h3>
            {hoverText && (
              <motion.p 
                className="text-gray-200 text-lg leading-relaxed"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {hoverText}
              </motion.p>
            )}
          </div>
        </div>

        {/* Animated Border */}
        <div className="border-glow-effect z-30" />
      </div>
    </motion.div>
  );
};
