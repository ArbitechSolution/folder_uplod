import React, { useState } from 'react'
// import { create as ipfsHttpClient } from 'ipfs-http-client'
import {Buffer} from 'buffer';
import { create } from 'ipfs-http-client'
import {
  Form,
  ListGroup,
  Badge,
  Button,
  ProgressBar,
  Container
} from 'react-bootstrap'
// const ipfs = ipfsHttpClient('https://rinkeby.infura.io/v3/3c8eeee2e3474d909e6a5ff7e9d5b2ab')
const all = require('it-all')
const projectId = 'basic'
const projectSecret = '99611ddd4f964dcb9facc3098178e5a8'
const projectIdAndSecret = `${projectId}:${projectSecret}`;
const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `basic ${Buffer.from(projectIdAndSecret).toString(
      'base64'
    )}`,
  },
})
export const FolderUpload = ({ setUrl }) => {
  const [files, setFiles] = useState([])
  const [folderUrl, setFolderUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploaded, setUploaded] = useState(false)

  const uploadFiles = async () => {
    try{
      let fileObjectsArray = Array.from(files).map((file) => {
        return {
          path: file.name,
          content: file
        }
      })
      console.log("fileObjectsArray",fileObjectsArray)
      const results = await all(
        ipfs.addAll(fileObjectsArray, { wrapWithDirectory: true })
      )
  
      console.log("Results after uploading ",results)
      return results
    }catch(e){
      console.log("Error while uploading files",e );
    }
   
  }

  const returnFilesUrl = async (e) => {
    try{
      setLoading(true)
      e.preventDefault()
      const results = await uploadFiles(files)
      const length = results.length
      const FilesHash = results[length - 1].cid._baseCache.get('z')
      console.log("FilesHash", FilesHash)
      // const FilesUrl = 'https://ipfs.infura.io/ipfs/' + FilesHash
      // setUrl(FilesUrl)
      // setFolderUrl(FilesUrl)
      // setLoading(false)
      // setUploaded(true)
    }catch(e){
      console.log("error while returning files Url",e );
    }
  
  }

  const   filesAndUploadButton = () => {
    if (files.length !== 0) {
      if (!loading) {
        return (
          <div>
            {uploaded ? (
              <h5>
                ✅{' '}
                <a
                  href={folderUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Folder
                </a>{' '}
                Uploaded Successfully ✅
              </h5>
            ) : (
              <div>
                <Button type='submit' className='mb-3'>
                  Upload Folder
                </Button>

                <ListGroup className='mb-3'>
                  {Array.from(files).map((file) => {
                    return (
                      <ListGroup.Item
                        as='li'
                        className='d-flex justify-content-between align-items-start'
                      >
                        <div className='ms-2 me-auto'>
                          {file.name}
                        </div>
                        <Badge pill>
                          {file.size} kb
                        </Badge>
                      </ListGroup.Item>
                    )
                  })}
                </ListGroup>
              </div>
            )}
          </div>
        )
      } else {
        return (
          <Container>
            <h4>Uploading Folder</h4>
            <ProgressBar animated now={100} />
            <h4>Please Wait ...</h4>
          </Container>
        )
      }
    }
  }

  return (
    <div>
      <Form onSubmit={returnFilesUrl}>
        <Form.Control
          required
          type='file'
          webkitdirectory='true'
          multiple
          onChange={(e) => setFiles(e.target.files)}
          className='mb-3'
        />

        {filesAndUploadButton()}
      </Form>
    </div>
  )
}