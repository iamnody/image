import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
// ! disable <React.StrictMode>
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import './App.scss'

export default function App() {
  const inputRef = useRef(null)

  const [filesInput, setfilesInput] = useState([])
  const [progress, setprogress] = useState(0)
  const [isUploading, setisUploading] = useState(false)
  const [displayImages, setdisplayImages] = useState([])

  const onFileDrop = async (e) => {
    if (e.target.files.length + filesInput.length > 5) {
      toast.error('Max 5 images at once')
      return
    }
    const filesArray = [...e.target.files].map((x) => {
      if (x.type.split('/')[0] === 'image') {
        return {
          file: x,
          url: URL.createObjectURL(x),
        }
      }
    })
    if (filesArray.includes(undefined)) {
      toast.error('Image only')
      return
    }
    setfilesInput((pre) => [...pre, ...filesArray])
  }

  function onClickDelete(url) {
    setfilesInput((pre) => pre.filter((x) => x.url !== url))
  }

  const upload = async () => {
    try {
      setisUploading(true)
      const formData = new FormData()
      filesInput.map((x) => formData.append('files', x.file))
      const res = await axios.post(
        process.env.NODE_ENV === 'production'
          ? 'api/upload/uploadImages'
          : `${process.env.REACT_APP_SERVER_URL_DEV}/api/upload/uploadImages`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent
            const percentage = Math.floor(
              ((loaded / 1000) * 100) / (total / 1000)
            )
            setprogress(percentage)
          },
        }
      )
      inputRef.current.value = null
      setfilesInput([])
      setisUploading(false)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDragEnd = ({ destination, source }) => {
    if (
      !destination ||
      (destination.index === source.index &&
        destination.droppableId === source.droppableId)
    ) {
      return
    }
    const filesCopy = filesInput[source.index]
    setfilesInput((prev) => {
      prev.splice(source.index, 1)
      prev.splice(destination.index, 0, filesCopy)
      return prev
    })
  }

  useEffect(() => {
    const controller = new AbortController()
    const fetchData = async () => {
      try {
        const res = await fetch(
          process.env.NODE_ENV === 'production'
            ? 'api/getImages'
            : `${process.env.REACT_APP_SERVER_URL_DEV}/api/getImages`,
          {
            signal: controller.signal,
          }
        )
        if (!res.ok) {
          throw new Error(res.statusText)
        }
        const data = await res.json()
        setdisplayImages(data)
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('the fetch was aborted')
        }
      }
    }
    fetchData()
    return () => {
      controller.abort()
    }
  }, [isUploading])

  return (
    <div className='App'>
      <div className='container'>
        <div className='upload-box'>
          <div className='h1'>
            OLIVER'S IMAGE <span>UPLOAD</span>
          </div>
          <small>* Max 5 images at once</small>
          <div className='drop-box'>
            <div className='drop-box-center'>
              <img src='/img/cloud.png' alt='' />
              <div className='drop-box-text'>Drop image files here</div>
            </div>
            <input
              className=''
              type='file'
              ref={inputRef}
              multiple
              onChange={onFileDrop}
            />
          </div>
          {!!filesInput.length && (
            <button className='upload-btn' onClick={upload}>
              <div className='text'>Upload</div>
              {isUploading && (
                <div className='progress'>
                  <div className='bar'>
                    <div
                      style={{ width: `${progress}%` }}
                      className='bar-percentage'
                    ></div>
                  </div>
                  <div className='percentage'>{progress}%</div>
                </div>
              )}
            </button>
          )}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={'uploadImageDroppable'}>
              {(provided, snapshot) => (
                <ul ref={provided.innerRef} {...provided.droppableProps}>
                  {filesInput.map((x, i) => (
                    // ! key is Draggable key, must be unique, not just i
                    <Draggable draggableId={x.url} index={i} key={x.url}>
                      {(provided, snapshot) => (
                        // ! must need className
                        <li
                          className='draggable'
                          key={i}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div className='img'>
                            <img src={x.url} alt='' />
                          </div>
                          <div className='file-name'>
                            <span>{x.file.name}</span>
                          </div>
                          <div
                            className='delete'
                            onClick={() => onClickDelete(x.url)}
                          >
                            X
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        <div className='gallery-box'>
          <div className='gallery-box-text'>Lastest uploaded Images</div>
          {isUploading && <div className='loading-text'>loading...</div>}
          <div className='gallery-images-box'>
            {displayImages.map((x, i) => (
              <div className='display-image' key={i}>
                <img
                  src={
                    process.env.NODE_ENV === 'production'
                      ? x.path
                      : `${process.env.REACT_APP_SERVER_URL_DEV}/${x.path}`
                  }
                  alt=''
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}
