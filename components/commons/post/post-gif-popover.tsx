"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import Image from "next/image";
import PoweredByGiphy from "@/public/powered-by-giphy.png";

import { Input } from "@heroui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { ImagePlay, Search } from "lucide-react";
import { Spinner } from "@heroui/spinner";

export const GifPopover = () => {
  const [gifs, setGifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchGifs(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    fetchGifs(searchTerm);
  }, []);

  const fetchGifs = async (query: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/giphy`, {
        params: { query },
      });
      setGifs(response.data.data);
    } catch (error) {
      console.error("Error fetching GIFs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Split gifs into two arrays for two columns
  const leftColumn = gifs.filter((_, i) => i % 2 === 0);
  const rightColumn = gifs.filter((_, i) => i % 2 !== 0);

  return (
    <Popover placement="bottom" className="w-72" radius="sm">
      <PopoverTrigger>
        <button>
          <ImagePlay size={20} />
        </button>
      </PopoverTrigger>

      <PopoverContent className="p-2 space-y-3">
        <Input
          variant="bordered"
          startContent={<Search size={16} />}
          placeholder="Search gifs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {loading && <Spinner className="py-4" />}

        {!loading && gifs.length > 0 && (
          <div className="flex gap-2 max-h-60 overflow-y-auto">
            <div className="flex flex-col gap-2 flex-1">
              {leftColumn.map((gif) => (
                <Image
                  key={gif.id}
                  src={gif.images.fixed_width.url}
                  alt={gif.title}
                  width={200}
                  height={parseInt(gif.images.fixed_width.height)}
                  className="rounded-lg object-cover"
                />
              ))}
            </div>

            <div className="flex flex-col gap-2 flex-1">
              {rightColumn.map((gif) => (
                <Image
                  key={gif.id}
                  src={gif.images.fixed_width.url}
                  alt={gif.title}
                  width={200}
                  height={parseInt(gif.images.fixed_width.height)}
                  className="rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {!loading && searchTerm && gifs.length === 0 && (
          <p className="text-sm text-muted-foreground">No results found.</p>
        )}

        <div className="flex w-full py-2 items-center justify-center invert dark:invert-0">
          <Image src={PoweredByGiphy} height={16} alt="Powered by Giphy" />
        </div>
      </PopoverContent>
    </Popover>
  );
};
