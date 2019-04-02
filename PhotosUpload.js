import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DropzoneComponent from 'react-dropzone-component';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { toastr } from 'react-redux-toastr';
// Redux Action
import { createListPhotos, removeListPhotos } from '../../actions/manageListPhotos';

// Style
import s from '!isomorphic-style-loader!css-loader!./filepicker.css';

// Translation
import { injectIntl, FormattedMessage } from 'react-intl';

import axios from 'axios';
import { apiUrl } from '../../constants/constants';
// Component
import PhotosList from '../PhotosList';

// Locale
import messages from '../../locale/messages';

class PhotosUpload extends Component {

	static propTypes = {
		createListPhotos: PropTypes.func.isRequired,
		removeListPhotos: PropTypes.func.isRequired,
		listId: PropTypes.number.isRequired,
	};

	constructor(props) {
		super(props);
		this.success = this.success.bind(this);
		this.complete = this.complete.bind(this);
		this.dropzone = null;
		this.original = ''
		this.imageData = false
	}

	componentDidMount() {
	const isBrowser = typeof window !== 'undefined';
	const isDocument = typeof document !== undefined;
	if (isBrowser && isDocument) {
	  document.querySelector(".dz-hidden-input").style.visibility = 'visible';
	  document.querySelector(".dz-hidden-input").style.opacity = '0';
	  document.querySelector(".dz-hidden-input").style.height = '100%';
	  document.querySelector(".dz-hidden-input").style.width = '100%';
	  document.querySelector(".dz-hidden-input").style.cursor = 'pointer';
	}
	}
	componentWillMount() {


	}

	success(file, fromServer) {
		const { listId, createListPhotos } = this.props;
		const { files } = fromServer;
		let fileName = files[0].filename;
		let fileType = files[0].mimetype;
		// Calling Redux action to create a record for uploaded file
		if(listId != undefined) {
		  createListPhotos(listId, fileName, fileType);
		}
	}

	complete(file) {
		const data ={
		 listId:this.props.listId
		}
		axios.post(apiUrl + '/checkImage',{data})
		  .then(res => {
			// console.log("iiiiiiiiiiiii",res)
			this.original = res.data.data
			// this.original.map((item, index) => {
			for (let i = 0; this.original.length > i; i++) {
			  // console.log("iiiiiiiiiiiiii", item)
			  if (this.original[i].originalName == file.name) {
				this.imageData = true
				this.dropzone.removeFile(file);
				toastr.error("Image Duplicacy Error", " Please Upload Different Images")
				break
			  }
			  else {
				this.imageData = false
			  }
			}
			if (!this.imageData) {
			  const { listId, createListPhotos } = this.props;
			  if (file && file.xhr) {
				const { files } = JSON.parse(file.xhr.response);
				let fileName = files[0].filename;
				let originalName = files[0].originalname
				let fileType = files[0].mimetype;
				if (listId != undefined) {
				  createListPhotos(listId, fileName, fileType, originalName);
				}
				this.dropzone.removeFile(file);
			  }
			  this.imageData = false;
			}
			else {
			  this.imageData = true;
			}
		})
	}




  render() {
    const { placeholder, listId } = this.props;
    const djsConfig = {
      dictDefaultMessage: placeholder,
      addRemoveLinks: false,
      maxFilesize: 10,
      maxFiles: 20,
      acceptedFiles: 'image/*',
      hiddenInputContainer: '.dzInputContainer'
    };
    const componentConfig = {
      iconFiletypes: ['.jpg', '.png'],
      //showFiletypeIcon: true,
      postUrl: '/photos'
    };
    const eventHandlers = {
      init: dz => this.dropzone = dz,
      success: this.success,
      complete: this.complete,
    };

    return (
      <div className={cx('listPhotoContainer')}>
        <div className={cx('dzInputContainer')}>
          <DropzoneComponent
            config={componentConfig}
            eventHandlers={eventHandlers}
            djsConfig={djsConfig}
          />
        </div>
        <span style={{ color: '#ff0000' }}>
          <strong>
            <FormattedMessage {...messages.photoText} />
          </strong>
        </span>
        <PhotosList listId={listId} />
      </div>
    );
  }

}

const mapState = (state) => ({});

const mapDispatch = {
  createListPhotos,
  removeListPhotos
};

export default withStyles(s)(connect(mapState, mapDispatch)(PhotosUpload));
