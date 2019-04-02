import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import TopNav from "./TopNav";
import ScreenRecording from "./ScreenRecorder";
import CareTeam from "./CareTeam";
import moment from "moment";
import { ZiggeoPlayer } from "react-ziggeo";
import { Link, Redirect } from "react-router-dom";
import toastr from "toastr";
import PatientCard from "./PatientDetailCard";
import AudioRecording from "./AudioRecorder";
import ShowMediaPopUp from "./ShowMediaPopUp";
import ReactPlayer from "react-player";
import { getImagePath, encounterIcon, getArray, setArray } from "./Manipulate";
import MediaComponents from "./MediaComponent";
import VideoRecordPopup from "./VideoRecordPopup";
import PatientNotification from "./PatientNotification";
import CloudPopupWindow from "./cloudPopupWindow";
import CircularProgress from "@material-ui/core/CircularProgress";

const PatientDetails = inject("store")(
  observer(
    class PatientDetails extends Component {
      constructor(props) {
        super(props);
        this.state = {
          show: false,
          adjust: false,
          loading: true,
          title: "",
          note: "",
          encounter: true,
          mediaPlayer: false,
          notification: false,
          careteam: false,
          flash: false,
          cloudPopup: "",
          videoPopup: "",
          image: {
            file: "",
            imagePreviewUrl: ""
          },
          loadAudioMedia: null
        };
        this.ChapterHeadRefArray = [];
        this.ChapterRefArray = [];
        this.showvideo = [];
        this.fieldlength = [];
        this.ChapterArray = [];
        this.newMediaArray = [];
        this.Audioarray = [];
        this.Screenarray = [];
        this.chaptersIsAvailable = true;
        this.chapter = [];
        this.video = "";
        this.mediatype = this.props.store.appState.mediatype;
        this.isMedia = false;
        this.pdfUrl = "";
        this.screenRecording = false;
      }

      // for showing chapter media and its details according to chapter
      mediaDataSet = (fields) => {
        if (fields.label === "Media Title") {
          this.mediaTitleValue.push(fields.value);
        }
        if (fields.label === "Media Link") {
          let arr = fields.value.split("/");
          let link = this.props.store.appState.getMediaLink;
          link.map((states, index) => {
            if (states.mediaId === getArray(arr, 2)) {
              this.mediadata.push(states);
            }
            return null;
          });
        }
        if (fields.label === "Media By") {
          this.mediaCreatedBy.push(fields.value);
        }
        if (fields.label === "Media Description") {
          this.mediaDiscription.push(fields.value);
        }
        if (fields.label === "Media Timestamp") {
          this.mediaTimeStamp.push(fields.value);
        }
      };

      //onclick for uploading a file
      uploadFile = (index, id, encounterid, templateType, chapterTitle) => {
        this.setState({
          cloudPopup: (
            <CloudPopupWindow
              open={true}
              cloudSelected={this.attachCloudData}
              index={index}
              id={id}
              templateType={templateType}
              show={true}
              encounterid={encounterid}
              close={this.closeCloudWindowPopup}
              chapterTitle={chapterTitle}
            />
          )
        });
        return null;
      };

      // for toggling notification if open by clicking anywhere in the file
      notificationClose = (e) => {
        this.setState({
          flash: !this.state.flash
        });
        return null;
      };

      showAllMediaDataFromServer = (index, states) => {
        return (
          <div className="col-xs-12 col-sm-12 no-pd media-frm dtBox">
            {this.showAddMedia(
              index,
              states.template.type,
              states.chapterTitle
            )}
            {getArray(this.Audioarray, index) ? (
              <div className="audio-compnent-layout">
                {this.state.loadAudioMedia}
              </div>
            ) : null}
            {getArray(this.Screenarray, index) ? this.state.loadMedia : null}

            {getArray(this.newMediaArray, index)
              ? this.showMediaCard(index, states)
              : null}

            {getArray(this.showvideo, index) ? (
              <div className="pr-nt">
                <div>{this.showUploadMedias(states)}</div>
              </div>
            ) : null}

            {getArray(this.fieldlength, index) ? (
              <div className="pr-nt">
                {this.showUploadMedias(states)}
                {this.mediadata.map((states, indexs) => {
                  return (
                    <div key={indexs}>
                      <MediaComponents
                        titleValue={this.mediaTitleValue}
                        mediaCreatedBy={this.mediaCreatedBy}
                        mediaDiscription={this.mediaDiscription}
                        index={indexs}
                        states={states}
                      />
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      };

      // callback function for showing recorded audio in perticular chapter
      data = () => {
        this.mediatype = this.props.store.appState.mediatype;
        this.id = this.props.store.appState.getvideopId;
        this.videoDetails = this.props.store.appState.getVideoData;
        for (let i = 0; i < this.newMediaArray.length; i++) {
          if (
            this.id.index === i &&
            this.id.id === this.props.match.params.id &&
            this.id.encounter === this.encounter.encounterId &&
            this.videoDetails.url !== ""
          ) {
            setArray(this.Audioarray, i, false);
            setArray(this.ChapterArray, i, true);
            setArray(this.newMediaArray, i, true);
            this.video = this.videoDetails.url;
            this.isMedia = true;
          }
          if (getArray(this.fieldlength, i) === false) {
            setArray(this.showvideo, i, true);
          }
        }
        this.setState({
          loadAudioMedia: null,
          title:
            this.id.templateType +
            "_Audio-" +
            Math.floor(Math.random() * 1000000 + 1)
        });
        return null;
      };

      //callabck function for taking image from web cam
      captureImage = (
        index,
        id,
        encounterid,
        rejectedReason,
        templateType,
        chapterTiltle
      ) => {
        this.props.store.appState.videopId(
          index,
          id,
          encounterid,
          templateType
        );
        this.props.store.appState.pageVideo("patient");
        this.props.history.push({
          pathname: "/image_capture",
          state: { templateType: chapterTiltle }
        });

        return null;
      };

      //for cancel the recorded media
      cancelmedia = (e) => {
        for (let i = 0; i < this.ChapterArray.length; i++) {
          if (i === parseInt(e.target.id)) {
            setArray(this.newMediaArray, i, false);
          }
        }
        this.props.store.appState.videopId("", "", "");
        this.setState({
          flash: !this.state.flash
        });
        return null;
      };

      //for saving recorede media
      savemedia = (e, data, k) => {
        e.preventDefault();
        this.videoDetails = this.props.store.appState.getVideoData;
        for (let i = 0; i < this.ChapterArray.length; i++) {
          if (i === k) {
            setArray(this.newMediaArray, i, !getArray(this.newMediaArray, i));
            // this.newMediaArray[i] = !getArray(this.newMediaArray, i);
            if (getArray(this.fieldlength, i) === false) {
              setArray(this.showvideo, i, true);
            }
          }
        }
        this.props.store.appState.videopId("", "", "");
        this.props.store.appState.uploadData(data);
        this.setState({
          flash: !this.state.flash,
          note: "",
          title: ""
        });
        return null;
      };

      //callback function for screen recorder
      screenRecordData = () => {
        this.id = this.props.store.appState.getvideopId;
        this.mediatype = this.props.store.appState.mediatype;
        this.videoDetails = this.props.store.appState.getStoreScreenRecordData;
        for (let i = 0; i < this.newMediaArray.length; i++) {
          if (
            this.id.index === i &&
            this.id.id === this.props.match.params.id &&
            this.id.encounter === this.encounter.encounterId &&
            this.videoDetails.id !== ""
          ) {
            setArray(this.ChapterArray, i, true);
            setArray(this.Screenarray, i, false);
            setArray(this.Audioarray, i, false);
            setArray(this.newMediaArray, i, true);
            this.video = this.videoDetails.id;
            this.isMedia = true;
          }
          if (getArray(this.fieldlength, i) === false) {
            setArray(this.showvideo, i, true);
          }
        }
        this.setState({
          loadMedia: null,
          title: "ScreenRecording-" + Math.floor(Math.random() * 1000000 + 1)
        });
        return null;
      };

      //callback function for screen recorder to check recording is on or not
      isRecording = (value) => {
        this.screenRecording = value;
        this.setState({ flash: true });
      };

      //for screen recorder
      loadScreenCaptureMedia = (e, index, id, encounterId) => {
        this.props.store.appState.videopId(index, id, encounterId);
        for (let i = 0; i < this.Screenarray.length; i++) {
          if (i === parseInt(e.target.id)) {
            setArray(this.Screenarray, i, !getArray(this.Screenarray, i));
            // this.Screenarray[i] = !this.Screenarray[i];
          }
        }
        this.setState({
          loadMedia: (
            <ScreenRecording
              data={this.screenRecordData}
              isRecording={this.isRecording}
            />
          )
        });
        return null;
      };

      //for toggling chapter card
      drop = (e) => {
        for (let i = 0; i < this.ChapterArray.length; i++) {
          if (i === parseInt(e.target.id)) {
            setArray(this.ChapterArray, i, !getArray(this.ChapterArray, i));
            // this.ChapterArray[i] = !this.ChapterArray[i];
            let elmnt = document.getElementById(
              getArray(this.ChapterRefArray, i).id
            );
            this.props.store.appState.heightOfChapter = getArray(
              this.ChapterRefArray,
              i
            ).id;
            elmnt.scrollIntoView();
            // this.ChapterHeadRefArray[i].className = "pr-sec p-car-sec"
          } else {
            setArray(this.newMediaArray, i, false);
            setArray(this.ChapterArray, i, false);
          }
        }
        this.setState({
          flash: !this.state.flash
        });
        return null;
      };

      //for recording audio
      loadAudio = (e, index, id, encounterid, templateType) => {
        this.props.store.appState.videopId(
          index,
          id,
          encounterid,
          templateType
        );
        for (let i = 0; i < this.Audioarray.length; i++) {
          if (i === parseInt(e.target.id)) {
            setArray(this.Audioarray, i, !getArray(this.Audioarray, i));
            // this.Audioarray[i] = !this.Audioarray[i];
          }
        }
        this.props.store.appState.pageVideo("patient");
        this.setState({
          loadAudioMedia: <AudioRecording data={this.data} />
        });
        return null;
      };

      //onclick of notes icon
      loadNotes = (e) => {
        this.setState({
          mediaPlayer: true
        });
      };

      //show add media card
      showAddMedia = (index, templateType, chapterTiltle) => {
        return (
          <div>
            <div className="add-media-cont">
              <div className="col-xs-12 pr-sec ">
                <div
                  className="add-media-sec col-xs-12 no-pd"
                  style={{ padding: "10px 10px" }}
                >
                  <div className="col-md-6 col-lg-6 col-xs-12 col-sm-6 no-pd mb-add-txt">
                    <h4 className="a-m-txt">Add Media</h4>
                  </div>
                  <div className="col-md-6 col-lg-6 col-xs-12 col-sm-6 no-pd icns">
                    <ul>
                      <li
                        onClick={(event) =>
                          this.loadScreenCaptureMedia(
                            event,
                            index,
                            this.props.match.params.id,
                            this.encounter.encounterId
                          )
                        }
                      >
                        <img
                          src="playBackIconsSet/ScreenCapture-filled.svg"
                          alt="img"
                          id={index}
                          title="Screen Capture"
                        />
                      </li>
                      <li
                        onClick={() =>
                          this.loadVideo(
                            index,
                            this.props.match.params.id,
                            this.encounter.encounterId,
                            templateType,
                            chapterTiltle
                          )
                        }
                      >
                        <img
                          src="playBackIconsSet/Camera-filled.svg"
                          alt="img"
                          title="Camera"
                        />
                      </li>
                      <li
                        onClick={(event) =>
                          this.loadAudio(
                            event,
                            index,
                            this.props.match.params.id,
                            this.encounter.encounterId,
                            templateType
                          )
                        }
                      >
                        <img
                          src="playBackIconsSet/Audio-Recording-filled.svg"
                          alt="img"
                          id={index}
                          title="Audio Recorder"
                        />
                      </li>
                      <li
                        onClick={(event) =>
                          this.showMediaPopUpFunction(
                            event,
                            "Alert",
                            "",
                            "Alert Window"
                          )
                        }
                      >
                        <img
                          src="playBackIconsSet/AddNote-EditNote-filled.svg"
                          alt="img"
                          title="Create notes"
                        />
                      </li>
                      <li
                        onClick={() =>
                          this.uploadFile(
                            index,
                            this.props.match.params.id,
                            this.encounter.encounterId,
                            templateType,
                            chapterTiltle
                          )
                        }
                      >
                        <img
                          src="playBackIconsSet/Upload-Save to Cloud-filled copyhdpi.png"
                          alt="img"
                          title="Upload Files"
                        />
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      };

      //for input text change
      handleChange = (e) => {
        const target = e.target;
        const name = target.name;
        const value = target.value;
        this.setState({
          [name]: value
        });
        return null;
      };

      //for showing all video, image and audio on popup whenever you click on any video,image or audio thumbnail
      showMediaPopUpFunction = (e, mediaType, url, mediaTitle) => {
        this.setState({
          mediaPlayer: (
            <ShowMediaPopUp
              mediaType={mediaType}
              close={this.closeShowMediaPopUp}
              url={url}
              mediaTitle={mediaTitle}
            />
          )
        });
      };

      //for showing card after uploading any media with title and note
      showMediaCard = (index, states) => {
        switch (this.mediatype) {
          case "video":
            this.uploadMediaData = {
              mediaType: this.mediatype,
              data: this.video,
              chapterid: states.chapterId,
              title: this.state.title,
              note: this.state.note
            };
            break;
          case "image":
            this.uploadMediaData = {
              mediaType: this.mediatype,
              data: this.$imagePreview.imagePreviewUrl,
              chapterid: states.chapterId,
              title: this.state.title,
              note: this.state.note
            };
            break;
          case "ScreenRecord":
            this.uploadMediaData = {
              mediaType: this.mediatype,
              data: this.video,
              name: this.pdfName,
              chapterid: states.chapterId,
              title: this.state.title,
              note: this.state.note
            };
            break;
          case "file":
            this.uploadMediaData = {
              mediaType: this.mediatype,
              data: "../playBackIconsSet/images/pdflogo.png",
              name: this.pdfName,
              chapterid: states.chapterId,
              title: this.state.title,
              note: this.state.note
            };
            break;
          case "audio":
            this.uploadMediaData = {
              mediaType: this.mediatype,
              data: this.video,
              chapterid: states.chapterId,
              title: this.state.title,
              note: this.state.note
            };
            break;
          default:
            return null;
        }

        return (
          <div className="col-xs-12 pr-sec add-m-create-sec" ref="media_card">
            <div
              className="add-media-sec add-img-sec col-xs-12 no-pd"
              style={{ padding: "20px 21px" }}
            >
              <div className="col-md-12 col-lg-12 col-xs-12 col-sm-12 no-pd c-m-txt mb-add-txt">
                <h4 className="a-m-txt">Create New</h4>
              </div>
              <form
                onSubmit={(e) => this.savemedia(e, this.uploadMediaData, index)}
              >
                <div className="col-md-12 col-lg-12 col-xs-12 col-sm-12 no-pd icns create-sec">
                  <div className="col-md-4 col-lg-4 col-sm-4 col-xs-12 no-pd">
                    {this.mediatype === "video" ? (
                      <div style={{ position: "relative", cursor: "pointer" }}>
                        <ReactPlayer
                          url={this.video}
                          controls={true}
                          width="340"
                          height="200"
                          style={{ opacity: 0.7 }}
                        />
                      </div>
                    ) : this.mediatype === "ScreenRecord" ? (
                      <div style={{ position: "relative", cursor: "pointer" }}>
                        <ZiggeoPlayer
                          width="340"
                          height="200"
                          apiKey="d6d4365ec3e662620622db75bd414511"
                          video={this.video}
                          theme={"modern"}
                          themecolor={"grey"}
                          skipinitial={false}
                        />
                      </div>
                    ) : this.mediatype === "image" ? (
                      <div>
                        <img
                          src={this.$imagePreview.imagePreviewUrl}
                          alt="img"
                          className="cre-add-img"
                          onClick={(event) =>
                            this.showMediaPopUpFunction(
                              event,
                              "image",
                              this.$imagePreview.imagePreviewUrl,
                              this.state.title
                            )
                          }
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                    ) : this.mediatype === "file" ? (
                      <a
                        href={this.pdfUrl}
                        style={{ cursor: "pointer" }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div>
                          <img
                            src="../playBackIconsSet/pdf.svg"
                            className="cre-add-img"
                            alt="img"
                          />
                        </div>
                      </a>
                    ) : (
                      <div>
                        <img
                          src="playBackIconsSet/Audio - Thumbnail.svg"
                          alt="img"
                          className="cre-add-img"
                          onClick={(event) =>
                            this.showMediaPopUpFunction(
                              event,
                              "Audio",
                              this.video,
                              this.state.title
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
                  <div className="col-md-8 col-lg-8 col-sm-8 col-xs-12 img-inps no-pd">
                    <input
                      type="text"
                      placeholder="File Name"
                      name="title"
                      id="md-title"
                      value={this.state.title}
                      onChange={this.handleChange}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Notes"
                      name="note"
                      value={this.state.note}
                      onChange={this.handleChange}
                      id="md-title"
                    />
                  </div>
                  <div
                    className="add-m-btns col-md-12 col-lg-12 col-xs-12 col-sm-12 no-pd"
                    style={{ marginBottom: -14 }}
                  >
                    <button
                      className="can-btn a-m-btn"
                      onClick={this.cancelmedia}
                      id={index}
                    >
                      Cancel
                    </button>
                    <button className="save a-m-btn" id={index}>
                      Save
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        );
      };

      //callback function for recording video
      recordVideo = (
        index,
        id,
        encounterid,
        rejected,
        templateType,
        chapterTiltle
      ) => {
        this.props.store.appState.videopId(
          index,
          id,
          encounterid,
          templateType
        );
        this.props.store.appState.pageVideo("patient");
        this.props.history.push({
          pathname: "/video_recording",
          state: { templateType: chapterTiltle }
        });
      };

      //onclick of camera icon
      loadVideo = (index, id, encounterid, templateType, chapterTitle) => {
        this.setState({
          videoPopup: (
            <VideoRecordPopup
              open={true}
              imageCapture={this.captureImage}
              recordVideo={this.recordVideo}
              index={index}
              id={id}
              templateType={templateType}
              show={true}
              encounterid={encounterid}
              close={this.closeVideoPopup}
              chapterTitle={chapterTitle}
            />
          )
        });
        return null;
      };

      //callback for attach files with cloud icons
      attachCloudData = (mediaType, fileName) => {
        this.mediatype = mediaType;
        this.id = this.props.store.appState.getvideopId;
        this.videoDetails = this.props.store.appState.getVideoData;
        for (let i = 0; i < this.newMediaArray.length; i++) {
          if (
            this.id.index === i &&
            this.id.id === this.props.match.params.id &&
            this.id.encounter === this.encounter.encounterId &&
            this.videoDetails.url !== ""
          ) {
            setArray(this.ChapterArray, i, true);
            setArray(this.newMediaArray, i, true);
            this.video = this.videoDetails.url;
            this.videoType = this.videoDetails.videoType;
            this.isMedia = true;
            if (mediaType === "video") {
              this.video = this.videoDetails.url;
            } else if (mediaType === "image") {
              this.$imagePreview = { imagePreviewUrl: this.videoDetails.url };
            } else if (mediaType === "file") {
              this.pdfUrl = this.videoDetails.url;
            }
          }
          if (getArray(this.fieldlength, i) === false) {
            setArray(this.showvideo, i, true);
          }
        }
        this.setState({
          cloudPopup: "",
          title: fileName
        });
        return null;
      };

      //function to close the camera popup
      closeVideoPopup = () => {
        this.setState({
          videoPopup: ""
        });
        return null;
      };

      //for closing upload popup
      closeCloudWindowPopup = () => {
        this.setState({
          cloudPopup: ""
        });
        return null;
      };

      //function to close the media popup
      closeShowMediaPopUp = () => {
        this.setState({
          mediaPlayer: null
        });
        return null;
      };

      //for knowing the rejection reason for media component
      handleDenied = (err) => {
        this.setState({ rejectedReason: err.name });
      };

      //for showing patient contact details
      showContact = (event) => {
        this.setState({
          show: !this.state.show
        });
        return null;
      };

      cancelScreenRecorder = () => {
        this.setState({
          loadMedia: null
        });
        return null;
      };

      //for layout of close chapters
      chapterHead = (states, index, imageSrc) => {
        return (
          <div style={{ cursor: "pointer" }} id={index}>
            <div
              className="pr-sec p-car-sec"
              onClick={this.drop}
              id={index}
              ref={(ref) => setArray(this.ChapterHeadRefArray, index, ref)}
            >
              <div className="pull-left" id={index}>
                <img
                  src={imageSrc}
                  alt="Today’s Visit"
                  className="img-reponsive"
                  style={{ width: 53, height: 53 }}
                  id={index}
                />
              </div>
              <div className="doc-info d-plt" id={index}>
                <h2 className="hd-ttl" id={index}>
                  {states.chapterTitle}
                </h2>
              </div>
            </div>
            <div onClick={this.drop} id={index}>
              {!getArray(this.ChapterArray, index) ? (
                <span className="down-arrow-stroke" id={index} />
              ) : (
                <span className="down-arrow-stroke active" id={index} />
              )}
            </div>
          </div>
        );
      };

      //show all uploded media by user according to perticular chapter
      showUploadMedias = (states) => {
        let array = [];
        array = this.props.store.appState.getUploadData;
        return array.map((state, index) => {
          if (state.chapterid === states.chapterId) {
            return (
              <div className="col-md-12 col-lg-12 col-sm-12 col-xs-12 d-ins">
                <div className="col-md-12 col-lg-12 col-sm-12 col-xs-12 d-data d-data-mb no-pd">
                  <div className="col-md-3 col-lg-3 col-sm-3 col-xs-12 pro-dis">
                    {state.mediaType === "video" ? (
                      <div
                        className="video-tab"
                        style={{ position: "relative", cursor: "pointer" }}
                        onClick={(event) =>
                          this.showMediaPopUpFunction(
                            event,
                            "video",
                            state.data,
                            state.title
                          )
                        }
                      >
                        <div>
                          <video
                            className="img-reponsive"
                            alt=""
                            onClick={(event) =>
                              this.showMediaPopUpFunction(
                                event,
                                "video",
                                state.data,
                                state.title
                              )
                            }
                          >
                            <source src={state.data} type="video/webm" />
                            <source src={state.data} type="video/mp4" />
                          </video>
                        </div>
                        <div>
                          <img
                            src="../playBackIconsSet/play-gal.svg"
                            alt="img"
                            style={{
                              position: "absolute",
                              height: 53,
                              width: 53,
                              bottom: 55,
                              marginLeft: 85
                            }}
                            onClick={(event) =>
                              this.showMediaPopUpFunction(
                                event,
                                "video",
                                state.data,
                                state.title
                              )
                            }
                          />
                        </div>
                      </div>
                    ) : state.mediaType === "image" ||
                      states.type === "photo" ? (
                      <div
                        className="video-tab"
                        style={{ position: "relative", cursor: "pointer" }}
                        onClick={(event) =>
                          this.showMediaPopUpFunction(
                            event,
                            "image",
                            state.data,
                            state.title
                          )
                        }
                      >
                        <img
                          src={state.data}
                          className="img-reponsive"
                          alt=""
                        />
                      </div>
                    ) : state.mediaType === "file" ? (
                      <a
                        href={this.pdfUrl}
                        style={{ cursor: "pointer" }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div
                          className="video-tab"
                          style={{ position: "relative", cursor: "pointer" }}
                        >
                          <img
                            src="../playBackIconsSet/images/pdflogo.png"
                            className="img-reponsive"
                            alt=""
                          />
                          <div>
                            <img
                              src="../playBackIconsSet/Document_Filled_Notification.svg"
                              alt="img"
                              style={{
                                position: "absolute",
                                height: 53,
                                width: 53,
                                bottom: 55,
                                marginLeft: 85
                              }}
                            />
                          </div>
                        </div>
                      </a>
                    ) : state.mediaType === "audio" ? (
                      <div
                        className="video-tab"
                        style={{ position: "relative", cursor: "pointer" }}
                        onClick={(event) =>
                          this.showMediaPopUpFunction(
                            event,
                            "Audio",
                            state.data,
                            state.title
                          )
                        }
                      >
                        <img
                          src="playBackIconsSet/Audio - Thumbnail.svg"
                          class="img-reponsive"
                          alt=""
                        />
                      </div>
                    ) : null}
                  </div>
                  <div className="col-md-9 col-lg-9 col-sm-9 col-xs-12 d-details pro-details-mb">
                    <h3>{state.title}</h3>
                    {/* <p className="d-date">
                      {moment(states.createdOn).format("MM/DD/YYYY")}
                    </p> */}
                    <p className="d-info hidden-xs">{state.note}</p>
                  </div>
                  <div className="doc-info doc-details d-ins-p no-pd">
                    <div className="d-txt d-ins-txt">
                      <p className="dr-n">
                        <span className="dr-name d-ins-name">
                          {localStorage.getItem("userPrefix") +
                            " " +
                            localStorage.getItem("userFirstName") +
                            " " +
                            localStorage.getItem("userLastName")}
                        </span>
                        <span className="dept">
                          {localStorage.getItem("speciality")}
                          <br />
                          {localStorage.getItem("department")}
                        </span>
                      </p>
                    </div>
                    <div className="prof-icon nurs-img">
                      <img
                        src={
                          getImagePath(localStorage.getItem("Photo")).imageUrl
                        }
                        alt="Dr.David Langer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        });
      };

      //for making navigation for encounter,notification and careteam member functional
      navTabClick = (e) => {
        switch (e.target.name) {
          case "encounter":
            this.refs.encounter.className = "active";
            this.refs.notification.className = "";
            this.refs.careteam.className = "";
            this.setState({
              encounter: true,
              notification: false,
              careteam: false
            });
            break;
          case "notification":
            this.refs.encounter.className = "";
            this.refs.notification.className = "active";
            this.refs.careteam.className = "";
            this.setState({
              encounter: false,
              notification: true,
              careteam: false
            });
            break;
          case "careteam":
            this.refs.encounter.className = "";
            this.refs.notification.className = "";
            this.refs.careteam.className = "active";
            this.setState({
              encounter: false,
              notification: false,
              careteam: true
            });
            break;
          default:
            return null;
        }
      };

      componentWillMount() {
        window.scrollTo(0, 0);
        let i = 0;

        //for getting details about the perticular patient whose detail page is opened
        this.flag = this.props.store.appState.getpatientdata(
          this.props.match.params.id
        );

        //for getting perticular notification
        this.encounter = this.props.store.appState.getEncounters(
          this.flag.patientId
        );
        let practitioner = this.encounter.appointment.practitioner.split("/");

        //for getting all the details for practionor of respective encounter
        this.encounterPractitioner = this.props.store.appState.practitionerData(
          practitioner[2]
        );

        // for chapter data
        this.chapter = this.props.store.appState.getChaptersData(
          this.encounter.chapters
        );

        //to intialize all the array length as per the number of chapter
        for (i = 0; i < this.chapter.length; i++) {
          this.ChapterArray.push(false);
          this.Screenarray.push(false);
          this.Audioarray.push(false);
          this.newMediaArray.push(false);
          this.showvideo.push(false);
          this.fieldlength.push(true);
        }

        //for getting encounter icon as per the encounter
        this.icon = encounterIcon(this.encounter.encounterType);

        //this is for getting encounter and chapter id of recoreded media
        this.id = this.props.store.appState.getvideopId;

        //for intialize the mediatype and data for recordede media
        if (this.props.store.appState.mediaType === "image") {
          this.videoDetails = this.props.store.appState.getImageData;
          this.mediaType = "image";
          this.setState({
            title:
              this.id.templateType +
              "_Image-" +
              Math.floor(Math.random() * 1000000 + 1)
          });
        } else {
          this.videoDetails = this.props.store.appState.getVideoData;
          this.setState({
            title:
              this.id.templateType +
              "_Video-" +
              Math.floor(Math.random() * 1000000 + 1)
          });
        }

        //to open perticular chapter which is used for recording media
        for (i = 0; i < this.newMediaArray.length; i++) {
          if (
            this.id.index === i &&
            this.id.id === this.props.match.params.id &&
            this.id.encounter === this.encounter.encounterId &&
            this.videoDetails.url !== ""
          ) {
            setArray(this.ChapterArray, i, !getArray(this.ChapterArray, i));
            setArray(this.newMediaArray, i, !getArray(this.newMediaArray, i));
            this.video = this.videoDetails.url;
            this.videoType = this.videoDetails.videoType;
            this.isMedia = true;
          }
          if (this.id.fieldLength === 0) {
            setArray(this.showvideo, i, true);
          }
        }

        //check if there in no encounter and no chapter present
        if (this.encounter.length === 0) {
          this.chaptersIsAvailable = false;
        } else {
          this.date = moment(this.encounter.appointment.datetime).format(
            "MM/DD/YYYY, h:mm a"
          );
          if (this.chapter.length === 0) {
            this.chaptersIsAvailable = false;
          }
        }
      }

      componentDidMount() {
        window.addEventListener("resize", this.adjust);

        //for openong careteam tab when you come back from add care team member page
        if (
          typeof this.props.location.state !== "undefined" &&
          this.props.location.state.page === "careteam"
        ) {
          this.refs.encounter.className = "";
          this.refs.notification.className = "";
          this.refs.careteam.className = "active";
          this.setState({
            encounter: false,
            notification: false,
            careteam: true
          });
        }

        //for loader
        if (this.state.loading) {
          this.setState(
            {
              loading: true
            },
            () => {
              this.timer = setTimeout(() => {
                this.setState({
                  loading: false
                });
              }, 1500);
            }
          );
        }
      }

      componentDidUpdate() {
        //to change the observable variable
        this.props.store.appState.getAppointmentsByAPiVariable = false;

        //for scrolling to the head of respective chapter as we open any chapter
        let elemt = document.getElementById(
          this.props.store.appState.heightOfChapter
        );
        if (this.isMedia && elemt !== null) {
          document
            .getElementById(this.props.store.appState.heightOfChapter)
            .scrollIntoView();
          this.isMedia = false;
        }
      }

      render() {
        //for loader
        if (typeof this.props.location.state === "undefined") {
          if (this.state.loading) {
            return (
              <CircularProgress
                size={50}
                style={{ marginLeft: "50%", marginTop: "20%" }}
              />
            );
          }
        }

        //to automatically logout if user is logged out and try to access this page
        if (localStorage.getItem("Token") === null) {
          toastr.error("you are logged out, please login first");
          return <Redirect to="/" />;
        }

        //to calling observable variable for appointment
        let appointment = this.props.store.appState.getAppointmentsByApi;

        localStorage.setItem("patient_id", this.props.match.params.id);
        localStorage.setItem("patient_mrn", this.flag.mrn);

        //for storing uplaoded image data
        let { imagePreviewUrl } = this.state.image;
        if (imagePreviewUrl) {
          this.$imagePreview = { imagePreviewUrl };
        }

        //for loading capture image data
        if (this.mediaType === "image" && !imagePreviewUrl) {
          this.$imagePreview = { imagePreviewUrl: this.videoDetails.url };
        }

        let providerChapter = [];

        //mapping of chapters
        if (this.chapter.length !== 0) {
          //for provider only chapter as it always should be at top
          providerChapter = this.chapter.map((states, index) => {
            if (states.template.type === "PO") {
              if (states.fields.length === 0) {
                setArray(this.fieldlength, index, false);
                setArray(this.showvideo, index, true);
              }
              this.mediaTitleValue = [];
              this.mediadata = [];
              this.mediaCreatedBy = [];
              this.mediaDiscription = [];
              this.mediaTimeStamp = [];
              let imageSrc = "/playBackIconsSet/Provider Only.svg";
              states.fields.map((fieldsStates, i) => {
                if (
                  fieldsStates.label === "Media Title" ||
                  fieldsStates.label === "Media Link" ||
                  fieldsStates.label === "Media By" ||
                  fieldsStates.label === "Media Description" ||
                  fieldsStates.label === "Media Timestamp"
                ) {
                  this.mediaDataSet(fieldsStates);
                }
                return null;
              });

              return (
                <div
                  className="col-xs-12 col-sm-12 enc-card"
                  key={index}
                  ref={(ref) => setArray(this.ChapterRefArray, index, ref)}
                  id={index}
                >
                  {this.chapterHead(states, index, imageSrc)}
                  {getArray(this.ChapterArray, index) ? (
                    <div>{this.showAllMediaDataFromServer(index, states)}</div>
                  ) : null}
                </div>
              );
            }
            return null;
          });

          //for showing all other chapters
          this.showchapters = this.chapter.map((states, index) => {
            let diagnosis = "";
            let imageSrc = "";
            let recommendations = "";
            let myResposibiltiy = [];

            //pre-op, additional information,daily updates, test result and nutrition instruction chapter
            if (
              states.template.type === "PP" ||
              states.template.type === "AI" ||
              states.template.type === "DU" ||
              states.template.type === "TR" ||
              states.template.type === "NI"
            ) {
              if (states.fields.length === 0) {
                setArray(this.fieldlength, index, false);
                setArray(this.showvideo, index, true);
              }
              this.mediaTitleValue = [];
              this.mediadata = [];
              this.file = false;
              this.mtype = "";
              this.mediaCreatedBy = [];
              this.mediaDiscription = [];
              this.mediaTimeStamp = [];
              imageSrc = "/playBackIconsSet/Pre-Op Prep.svg";
              states.fields.map((fieldsStates, i) => {
                if (
                  fieldsStates.label === "Media Title" ||
                  fieldsStates.label === "Media Link" ||
                  fieldsStates.label === "Media By" ||
                  fieldsStates.label === "Media Description" ||
                  fieldsStates.label === "Media Timestamp"
                ) {
                  this.mediaDataSet(fieldsStates);
                }
                return null;
              });

              return (
                <div
                  className="col-xs-12 col-sm-12 enc-card"
                  key={index}
                  ref={(ref) => setArray(this.ChapterRefArray, index, ref)}
                  id={index}
                >
                  {this.chapterHead(states, index, imageSrc)}
                  {getArray(this.ChapterArray, index) ? (
                    <div>{this.showAllMediaDataFromServer(index, states)}</div>
                  ) : null}
                </div>
              );
            }

            //todays visit chapter
            else if (states.template.type === "TV") {
              if (states.fields.length === 0) {
                setArray(this.fieldlength, index, false);
                setArray(this.showvideo, index, true);
              }
              this.mediaTitleValue = [];
              this.mediadata = [];
              this.mediaCreatedBy = [];
              this.mediaDiscription = [];
              this.mediaTimeStamp = [];
              imageSrc = "/playBackIconsSet/Today's Visit.svg";
              states.fields.map((fieldsStates, i) => {
                if (
                  fieldsStates.label === "Media Title" ||
                  fieldsStates.label === "Media Link" ||
                  fieldsStates.label === "Media By" ||
                  fieldsStates.label === "Media Description" ||
                  fieldsStates.label === "Media Timestamp"
                ) {
                  this.mediaDataSet(fieldsStates);
                }
                if (fieldsStates.label === "Diagnosis") {
                  this.diagnosis = fieldsStates.value;
                }
                if (fieldsStates.label === "Our Recommendations") {
                  this.recommendations = fieldsStates.value;
                }
                return null;
              });

              return (
                <div
                  className="col-xs-12 col-sm-12 enc-card"
                  key={index}
                  ref={(ref) => setArray(this.ChapterRefArray, index, ref)}
                  id={index}
                >
                  {this.chapterHead(states, index, imageSrc)}
                  {getArray(this.ChapterArray, index) ? (
                    <div>
                      {this.showAllMediaDataFromServer(index, states)}
                      {getArray(this.fieldlength, index) ? (
                        <div className="pr-nt">
                          <div className="col-lg-12 no-pd chapter-text-data-layout">
                            <div className="doc-info d-plt pr-notes ">
                              <div />
                              <h3>Diagnosis</h3>
                              <div ref="diagnosistv">
                                <h4>{this.diagnosis}</h4>
                              </div>
                              <h3>Our Recommendations</h3>
                              <div ref="recommendations">
                                <h4>{this.recommendations}</h4>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            }

            //my responsibility chapter
            else if (states.template.type === "MR") {
              if (states.fields.length === 0) {
                setArray(this.fieldlength, index, false);
                setArray(this.showvideo, index, true);
              }
              this.mediaTitleValue = [];
              this.mediadata = [];
              this.mediaCreatedBy = [];
              this.mediaDiscription = [];
              this.mediaTimeStamp = [];
              imageSrc = "/playBackIconsSet/My Responsibilities.svg";
              states.fields.map((fieldsStates, i) => {
                if (
                  fieldsStates.label === "Media Title" ||
                  fieldsStates.label === "Media Link" ||
                  fieldsStates.label === "Media By" ||
                  fieldsStates.label === "Media Description" ||
                  fieldsStates.label === "Media Timestamp"
                ) {
                  this.mediaDataSet(fieldsStates);
                }
                if (fieldsStates.label === "My Responsiblities") {
                  myResposibiltiy = fieldsStates.value;
                }
                return null;
              });

              return (
                <div
                  className="col-xs-12 col-sm-12 enc-card"
                  key={index}
                  ref={(ref) => setArray(this.ChapterRefArray, index, ref)}
                  id={index}
                >
                  {this.chapterHead(states, index, imageSrc)}
                  {getArray(this.ChapterArray, index) ? (
                    <div>
                      {this.props.store.appState.getAppointments(
                        localStorage.getItem("patient_id"),
                        states.chapterId,
                        states.encounterId,
                        this.encounter.encounterType
                      )}
                      {this.showAllMediaDataFromServer(index, states)}
                      {getArray(this.fieldlength, index) ? (
                        <div className="pr-nt">
                          <div>
                            <div className="pr-nt-reminders">
                              <div className="col-md-12 col-lg-12 col-xs-12 d-ins-reminder">
                                <div
                                  className="col-md-12 col-lg-12 col-xs-12 no-pd"
                                  style={{ margin: "1% 0 -1% 0" }}
                                >
                                  <div className="col-md-6 col-xs-6 no-pd">
                                    <p className="reminder-text">Reminder</p>
                                  </div>
                                </div>
                                <div className="col-md-12 col-lg-12 d-data rem-card no-pd">
                                  {myResposibiltiy.map((data, index) => {
                                    return (
                                      <div
                                        className="col-md-12 col-lg-12 chks"
                                        key={index}
                                      >
                                        <label className="check-box">
                                          <input
                                            type="checkbox"
                                            name=""
                                            className="chk"
                                          />
                                          <span className="check-span" />
                                          <p>
                                            {data} <br />{" "}
                                            <span>2 days remaining</span>
                                          </p>
                                        </label>
                                      </div>
                                    );
                                  })}
                                  <div className="col-md-12 col-lg-12 add-remainder">
                                    <input
                                      type="text"
                                      name=""
                                      className="rmain_txt"
                                      placeholder="Add New Remainder"
                                    />
                                    <button className="add-remin-btn">
                                      Send
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="pr-nt-reminders">
                              {typeof this.props.store.appState
                                .appointmentWithApi.UpcomingAppointments ===
                              "undefined" ? null : (
                                <div className="col-md-12 col-lg-12 col-xs-12 d-ins-reminder">
                                  <div
                                    className="col-md-12 col-lg-12 col-xs-12 no-pd"
                                    style={{ margin: "1% 0 -1% 0" }}
                                  >
                                    <div className="col-md-6 col-xs-6 no-pd">
                                      <p className="rem">
                                        Upcoming Appointments
                                      </p>
                                    </div>
                                  </div>

                                  <div
                                    id="all-en-count"
                                    className="col-md-12 col-lg-12 d-data-appointment appointment-background no-pd"
                                  >
                                    <div ref="Appointments">
                                      {this.props.store.appState.appointmentWithApi.UpcomingAppointments.map(
                                        (data, index) => {
                                          let arr = data.practitionerid.split(
                                            "/"
                                          );
                                          let appointmentPractitionerData = this.props.store.appState.getPractitionerDetails(
                                            arr[2]
                                          );
                                          return (
                                            <div
                                              className="col-md-12 col-lg-12 ard no-pd"
                                              key={index}
                                            >
                                              <div className="col-xs-12 no-pd rec-enc-wpr-appointment no-bor">
                                                <div className="h-pads">
                                                  <div
                                                    className="col-xs-12 enc-card no-bg no-pd no-mg"
                                                    style={{ border: "none" }}
                                                  >
                                                    <div className="pr-tp-sec enc-info">
                                                      <div className="doc-info col-md-6 col-lg-6 no-pd hos-data">
                                                        <div className="prof-icon">
                                                          <img
                                                            src={encounterIcon(
                                                              data.encounterType
                                                            )}
                                                            alt="Hospitalization"
                                                            width="72%"
                                                          />
                                                        </div>
                                                        <div className="appointment-title-pos">
                                                          <h2>
                                                            {
                                                              data.encounterTitle
                                                            }
                                                            <span className="dte">
                                                              {moment(
                                                                data.datetime
                                                              ).format(
                                                                "MM/DD/YYYY, h:mm a"
                                                              )}
                                                            </span>
                                                          </h2>
                                                        </div>
                                                      </div>
                                                      <div className="doc-info doc-details col-md-4 col-lg-4 no-pd">
                                                        <div className="d-txt-appointment">
                                                          <p className="dr-n">
                                                            <span className="dr-name">
                                                              {data.name}
                                                            </span>{" "}
                                                            <span className="dept">
                                                              {
                                                                appointmentPractitionerData
                                                                  .specialty[0]
                                                                  .coding[0]
                                                                  .display
                                                              }{" "}
                                                              <br />{" "}
                                                              {
                                                                appointmentPractitionerData
                                                                  .specialty[0]
                                                                  .coding[0]
                                                                  .system
                                                              }
                                                            </span>
                                                          </p>
                                                        </div>
                                                        <div className="prof-icon dr-img">
                                                          <img
                                                            src={
                                                              getImagePath(
                                                                appointmentPractitionerData
                                                                  .photo.url
                                                              ).imageUrl
                                                            }
                                                            alt="Dr.David Langer"
                                                          />
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            }

            //discharge instruction chapter
            else if (states.template.type === "DI") {
              if (states.fields.length === 0) {
                setArray(this.fieldlength, index, false);
                setArray(this.showvideo, index, true);
              }
              this.mediaTitleValue = [];
              this.mediadata = [];
              this.mediaCreatedBy = [];
              this.mediaDiscription = [];
              this.mediaTimeStamp = [];
              let dischargedTo = "";
              let dischargeLocationAddress = "";
              let dischargeLocationPhoneNumber = "";
              let caseMangePhoneNumber = "";
              imageSrc = "/playBackIconsSet/Discharge Instructions.svg";
              states.fields.map((fieldsStates, i) => {
                if (
                  fieldsStates.label === "Media Title" ||
                  fieldsStates.label === "Media Link" ||
                  fieldsStates.label === "Media By" ||
                  fieldsStates.label === "Media Description" ||
                  fieldsStates.label === "Media Timestamp"
                ) {
                  this.mediaDataSet(fieldsStates);
                }
                if (fieldsStates.label === "Discharged to") {
                  dischargedTo = fieldsStates.value;
                }
                if (fieldsStates.label === "Discharge Location Address") {
                  dischargeLocationAddress = fieldsStates.value;
                }
                if (fieldsStates.label === "Discharge Location Phone Number") {
                  dischargeLocationPhoneNumber = fieldsStates.value;
                }
                if (
                  fieldsStates.label ===
                  "Case Manger/Social Worker Phone Number"
                ) {
                  caseMangePhoneNumber = fieldsStates.value;
                }
                return null;
              });

              return (
                <div
                  className="col-xs-12 col-sm-12 enc-card"
                  key={index}
                  ref={(ref) => setArray(this.ChapterRefArray, index, ref)}
                  id={index}
                >
                  {this.chapterHead(states, index, imageSrc)}
                  {getArray(this.ChapterArray, index) ? (
                    <div>
                      {this.showAllMediaDataFromServer(index, states)}
                      {getArray(this.fieldlength, index) ? (
                        <div className="pr-nt">
                          <div className="col-lg-12 no-pd chapter-text-data-layout">
                            <div className="doc-info d-plt pr-notes row">
                              <div className="row">
                                <div className="col-sm-4">
                                  <br />
                                  <div>
                                    <label>Discharged to</label>
                                  </div>
                                </div>
                                <div className="col-sm-8">
                                  <br />
                                  <div ref="dischargedTo">{dischargedTo}</div>
                                </div>
                              </div>
                              <div />
                              <h3>Discharge Location Address</h3>
                              <div ref="dischargeLocationAddress">
                                <h4>{dischargeLocationAddress}</h4>
                              </div>
                              <h3>Discharge Location Phone Number</h3>
                              <div ref="dischargeLocationPhoneNumber">
                                <h4>{dischargeLocationPhoneNumber}</h4>
                              </div>
                              <h3>Case Manger/Social Worker Phone Number</h3>
                              <div ref="caseMangePhoneNumber">
                                <h4>{caseMangePhoneNumber}</h4>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            }

            //about hospitalisation chapter
            else if (states.template.type === "AH") {
              if (states.fields.length === 0) {
                setArray(this.fieldlength, index, false);
                setArray(this.showvideo, index, true);
              }
              this.mediaTitleValue = [];
              this.mediadata = [];
              this.mediaCreatedBy = [];
              this.mediaDiscription = [];
              this.mediaTimeStamp = [];
              let Procedure = "";
              let procedureDate = "";
              let aboutYourProcedure = "";
              let admitDate = "";
              let dischargeDate = "";
              imageSrc = "/playBackIconsSet/About Your Hospitalization.svg";
              states.fields.map((fieldsStates, i) => {
                if (
                  fieldsStates.label === "Media Title" ||
                  fieldsStates.label === "Media Link" ||
                  fieldsStates.label === "Media By" ||
                  fieldsStates.label === "Media Description" ||
                  fieldsStates.label === "Media Timestamp"
                ) {
                  this.mediaDataSet(fieldsStates);
                }
                if (fieldsStates.label === "Diagnosis") {
                  diagnosis = fieldsStates.value;
                }
                if (fieldsStates.label === "Procedure") {
                  Procedure = fieldsStates.value;
                }
                if (fieldsStates.label === "Procedure Date") {
                  procedureDate = fieldsStates.value;
                }
                if (fieldsStates.label === "About Your Procedure") {
                  aboutYourProcedure = fieldsStates.value;
                }
                if (fieldsStates.label === "Admit Date") {
                  admitDate = fieldsStates.value;
                }
                if (fieldsStates.label === "Discharge Date") {
                  dischargeDate = fieldsStates.value;
                }
                return null;
              });

              return (
                <div
                  className="col-xs-12 col-sm-12 enc-card"
                  key={index}
                  ref={(ref) => setArray(this.ChapterRefArray, index, ref)}
                  id={index}
                >
                  {this.chapterHead(states, index, imageSrc)}
                  {getArray(this.ChapterArray, index) ? (
                    <div>
                      {this.showAllMediaDataFromServer(index, states)}
                      {getArray(this.fieldlength, index) ? (
                        <div className="pr-nt">
                          <div className="chapter-text-data-layout">
                            <div className="doc-info d-plt pr-notes ">
                              <h3>Diagnosis</h3>
                              <div ref="diagnosis">
                                <h4>{diagnosis}</h4>
                              </div>
                              <h3>Procedure</h3>
                              <div ref="Procedure">
                                <h4>{Procedure}</h4>
                              </div>
                              <h3>Procedure Date</h3>
                              <div ref="procedureDate">
                                <h4>{procedureDate}</h4>
                              </div>
                              <h3>About Your Procedure Date</h3>
                              <div ref="aboutYourProcedure">
                                <h4>{aboutYourProcedure}</h4>
                              </div>
                              <h3>Admit Date</h3>
                              <div ref="admitDate">
                                <h4>{admitDate}</h4>
                              </div>
                              <h3>Discharge Date</h3>
                              <div ref="dischargeDate">
                                <h4>{dischargeDate}</h4>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            }

            //medication instruction chapter
            else if (states.template.type === "MI") {
              if (states.fields.length === 0) {
                setArray(this.fieldlength, index, false);
                setArray(this.showvideo, index, true);
              }
              this.mediaTitleValue = [];
              this.mediadata = [];
              this.mediaCreatedBy = [];
              this.mediaDiscription = [];
              this.mediaTimeStamp = [];
              let medicationName = [];
              let Dose = [];
              let howManyTimesAday = [];
              let useAsNeededCheckbox = [];
              let Purpose = [];
              let sideEffects = [];
              let drivingCheckbox = [];
              imageSrc = "/playBackIconsSet/Medication.svg";
              states.fields.map((fieldsStates, i) => {
                if (
                  fieldsStates.label === "Media Title" ||
                  fieldsStates.label === "Media Link" ||
                  fieldsStates.label === "Media By" ||
                  fieldsStates.label === "Media Description" ||
                  fieldsStates.label === "Media Timestamp"
                ) {
                  this.mediaDataSet(fieldsStates);
                }
                if (fieldsStates.label === "Medication Name") {
                  medicationName.push(fieldsStates.value);
                }
                if (fieldsStates.label === "Dose") {
                  Dose.push(fieldsStates.value);
                }
                if (fieldsStates.label === "How many times a day") {
                  howManyTimesAday.push(fieldsStates.value);
                }
                if (fieldsStates.label === "Use As Needed - Checkbox") {
                  useAsNeededCheckbox.push(fieldsStates.value);
                }
                if (fieldsStates.label === "Purpose") {
                  Purpose.push(fieldsStates.value);
                }
                if (fieldsStates.label === "Side Effects") {
                  sideEffects.push(fieldsStates.value);
                }
                if (fieldsStates.label === "Driving- Checkbox") {
                  drivingCheckbox.push(fieldsStates.value);
                }
                return null;
              });

              return (
                <div
                  className="col-xs-12 col-sm-12 enc-card"
                  key={index}
                  ref={(ref) => setArray(this.ChapterRefArray, index, ref)}
                  id={index}
                >
                  {this.chapterHead(states, index, imageSrc)}
                  {getArray(this.ChapterArray, index) ? (
                    <div>
                      {this.showAllMediaDataFromServer(index, states)}
                      {getArray(this.fieldlength, index) ? (
                        <div className="pr-nt">
                          <div className="row">
                            <div className="col-sm-11 chapter-text-data-layout">
                              <div
                                className="doc-info d-plt pr-notes"
                                ref="MedicationInstruction"
                                style={{ paddingLeft: 10 }}
                              >
                                {medicationName.map((data, index) => {
                                  return (
                                    <div key={index}>
                                      <br />
                                      <div className="row">
                                        <div className="col-sm-6">
                                          <h3>{data}</h3>
                                        </div>
                                        <div className="col-sm-6">
                                          <h3>{getArray(Dose, index)}</h3>
                                        </div>
                                      </div>
                                      <br />
                                      <div>
                                        How many times a day :{"  "}
                                        &nbsp;
                                        {" " +
                                          getArray(howManyTimesAday, index)}
                                      </div>

                                      <br />
                                      <div>
                                        Use As Needed : &nbsp;
                                        {"  " +
                                          getArray(useAsNeededCheckbox, index)}
                                      </div>
                                      <br />
                                      <div>
                                        Purpose : &nbsp;
                                        {"  " + getArray(Purpose, index)}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="col-sm-1">
                              <div />
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            }

            //activity and ristriction chapter
            else if (states.template.type === "AR") {
              if (states.fields.length === 0) {
                setArray(this.fieldlength, index, false);
                setArray(this.showvideo, index, true);
              }
              this.mediaTitleValue = [];
              this.mediadata = [];
              this.mediaCreatedBy = [];
              this.mediaDiscription = [];
              this.mediaTimeStamp = [];
              let makeSure = "";
              let doNot = "";
              imageSrc = "/playBackIconsSet/Activities and Restrictions.svg";
              states.fields.map((fieldsStates, i) => {
                if (
                  fieldsStates.label === "Media Title" ||
                  fieldsStates.label === "Media Link" ||
                  fieldsStates.label === "Media By" ||
                  fieldsStates.label === "Media Description" ||
                  fieldsStates.label === "Media Timestamp"
                ) {
                  this.mediaDataSet(fieldsStates);
                }
                if (fieldsStates.label === "Diagnosis") {
                  diagnosis = fieldsStates.value;
                }
                if (fieldsStates.label === "Our Recommendations") {
                  recommendations = fieldsStates.value;
                }
                if (fieldsStates.label === "Make Sure You") {
                  makeSure = fieldsStates.value;
                }
                if (fieldsStates.label === "Do Not") {
                  doNot = fieldsStates.value;
                }
                return null;
              });

              return (
                <div
                  className="col-xs-12 col-sm-12 enc-card"
                  key={index}
                  ref={(ref) => setArray(this.ChapterRefArray, index, ref)}
                  id={index}
                >
                  {this.chapterHead(states, index, imageSrc)}
                  {getArray(this.ChapterArray, index) ? (
                    <div>
                      {this.showAllMediaDataFromServer(index, states)}
                      {getArray(this.fieldlength, index) ? (
                        <div className="pr-nt">
                          <div className="col-lg-12 no-pd chapter-text-data-layout">
                            <div className="doc-info d-plt pr-notes">
                              <div />
                              <br />
                              <h2>Make Sure You</h2>
                              <div ref="makeSure">
                                <h4>{makeSure}</h4>
                              </div>
                              <br />
                              <h2>Do Not</h2>
                              <div ref="doNot">
                                <h4>{doNot}</h4>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            }

            //symptom manager chapter
            else if (states.template.type === "SM") {
              if (states.fields.length === 0) {
                setArray(this.fieldlength, index, false);
                setArray(this.showvideo, index, true);
              }
              this.mediaTitleValue = [];
              this.mediadata = [];
              this.mediaCreatedBy = [];
              this.mediaDiscription = [];
              this.mediaTimeStamp = [];
              let goTo = "";
              let call = "";
              let dontAlamred = "";
              imageSrc = "/playBackIconsSet/Symptom Manager.svg";
              states.fields.map((fieldsStates, i) => {
                if (
                  fieldsStates.label === "Media Title" ||
                  fieldsStates.label === "Media Link" ||
                  fieldsStates.label === "Media By" ||
                  fieldsStates.label === "Media Description" ||
                  fieldsStates.label === "Media Timestamp"
                ) {
                  this.mediaDataSet(fieldsStates);
                }
                if (fieldsStates.label === "Go To Emergency Room If") {
                  goTo = fieldsStates.value;
                }
                if (fieldsStates.label === "Call Our Office at (#) if") {
                  call = fieldsStates.value;
                }
                if (
                  fieldsStates.label === "Dont Be Alarmed if You Experience"
                ) {
                  dontAlamred = fieldsStates.value;
                }
                return null;
              });

              return (
                <div
                  className="col-xs-12 col-sm-12 enc-card"
                  key={index}
                  ref={(ref) => setArray(this.ChapterRefArray, index, ref)}
                  id={index}
                >
                  {this.chapterHead(states, index, imageSrc)}
                  {getArray(this.ChapterArray, index) ? (
                    <div>
                      {this.showAllMediaDataFromServer(index, states)}
                      {getArray(this.fieldlength, index) ? (
                        <div className="pr-nt">
                          <div className="chapter-text-data-layout">
                            <div className="doc-info d-plt pr-notes">
                              <div />
                              <br />
                              <h2>Go To Emergency Room If</h2>
                              <div ref="goTo">
                                <h4>{goTo}</h4>
                              </div>
                              <br />
                              <h2>Call Our Office at (#) if</h2>
                              <div ref="call">
                                <h4>{call}</h4>
                              </div>
                              <br />
                              <h2>Dont Be Alarmed if You Experience</h2>
                              <div ref="dontAlamred">
                                <h4>{dontAlamred}</h4>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            }

            //wound care chapter
            else if (states.template.type === "WC") {
              if (states.fields.length === 0) {
                setArray(this.fieldlength, index, false);
                setArray(this.showvideo, index, true);
              }
              this.mediaTitleValue = [];
              this.mediadata = [];
              this.mediaCreatedBy = [];
              this.mediaDiscription = [];
              this.mediaTimeStamp = [];
              let ShouldDo = [];
              let ShouldNotDo = [];
              imageSrc = "/playBackIconsSet/Wound Care Instructions.svg";
              states.fields.map((fieldsStates, i) => {
                if (
                  fieldsStates.label === "Media Title" ||
                  fieldsStates.label === "Media Link" ||
                  fieldsStates.label === "Media By" ||
                  fieldsStates.label === "Media Description" ||
                  fieldsStates.label === "Media Timestamp"
                ) {
                  this.mediaDataSet(fieldsStates);
                }
                if (fieldsStates.label === "Diagnosis") {
                  diagnosis = fieldsStates.value;
                }
                if (fieldsStates.label === "Our Recommendations") {
                  recommendations = fieldsStates.value;
                }
                if (fieldsStates.label === "Make Sure You") {
                  ShouldDo = fieldsStates.value;
                }
                if (fieldsStates.label === "Do Not") {
                  ShouldNotDo = fieldsStates.value;
                }
                return null;
              });

              return (
                <div
                  className="col-xs-12 col-sm-12 enc-card"
                  key={index}
                  ref={(ref) => setArray(this.ChapterRefArray, index, ref)}
                  id={index}
                >
                  {this.chapterHead(states, index, imageSrc)}
                  {getArray(this.ChapterArray, index) ? (
                    <div>
                      {this.showAllMediaDataFromServer(index, states)}
                      {getArray(this.fieldlength, index) ? (
                        <div className="pr-nt">
                          <div className="col-lg-12 no-pd chapter-text-data-layout">
                            <div className="doc-info d-plt pr-notes">
                              <div />
                              <br />
                              <h2>Make Sure You</h2>
                              <br />
                              <div ref="ShouldDo">
                                <h4>
                                  {ShouldDo.map((data, index) => {
                                    return (
                                      <div key={index}>
                                        {"  " + "  " + data}
                                        <br />
                                      </div>
                                    );
                                  })}
                                </h4>
                              </div>
                              <br />
                              <h2>Should Not Do</h2>
                              <div ref="ShouldNotDo">
                                <h4>
                                  <ul>
                                    {ShouldNotDo.map((data, index) => {
                                      return (
                                        <div key={index}>{" " + data}</div>
                                      );
                                    })}
                                  </ul>
                                </h4>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            }

            //care team chapter
            else if (states.template.type === "CT") {
              imageSrc = "/playBackIconsSet/Care Team.svg";
              this.mediaTitleValue = [];
              this.mediadata = [];
              this.mediaCreatedBy = [];
              this.mediaDiscription = [];
              this.mediaTimeStamp = [];
              let prefix = "";
              let Department = "";
              let location = "";
              let phoneNumber = "";
              let emailAddress = "";
              let Address = "";
              let Photo = "";
              let name = "";
              let Specialty = "";
              this.finalData = states.fields.map((x, index) => {
                return (
                  <div key={index}>
                    <div className="row" style={{ marginTop: "2%" }}>
                      <h3 style={{ marginLeft: 20 }}>
                        {x.category.toUpperCase()}
                      </h3>
                    </div>
                    {x.members.map((y, index) => {
                      return (
                        <div style={{ marginLeft: "1%" }} key={index}>
                          <br />
                          <div>
                            <strong style={{ textDecoration: "underline" }}>
                              {y.title.toUpperCase()}
                            </strong>
                          </div>
                          {y.data.map((z, index) => {
                            if (z.label === "Provider Title") {
                              prefix = z.value;
                            }
                            if (z.label === "Relationship") {
                              prefix = z.value;
                              Department = "";
                            }
                            if (
                              z.label === "Name of Provider" ||
                              z.label === "Name"
                            ) {
                              name = z.value;
                            }
                            if (z.label === "Specialty") {
                              Specialty = z.value;
                            }
                            if (z.label === "Provider Department") {
                              Department = z.value;
                            }
                            if (z.label === "Location") {
                              location = z.value;
                            }
                            if (z.label === "Mobile Number") {
                              phoneNumber = z.value;
                            }
                            if (z.label === "Email") {
                              emailAddress = z.value;
                            }
                            if (z.label === "Address") {
                              Address = z.value;
                            }
                            if (z.label === "Photo") {
                              Photo = z.value;
                            }
                            return null;
                          })}
                          <div key={index}>
                            <div className="pat-card row care-team-chapter-card">
                              <div className=" prof-icon text-center">
                                <img
                                  alt="img"
                                  src={getImagePath(Photo).imageUrl}
                                />
                              </div>
                              <div
                                className="col-sm-10"
                                style={{ textAlign: "left", marginTop: "-1%" }}
                              >
                                <div style={{ marginLeft: "2%" }}>
                                  {Department === "" ? (
                                    <div style={{ marginTop: "3%" }}>
                                      <h3>{name}</h3>
                                      <h4>{prefix}</h4>
                                    </div>
                                  ) : (
                                    <div>
                                      <h3>{name}</h3>
                                      <h4>{prefix}</h4>
                                      <div style={{ marginTop: "1%" }}>
                                        <h4>{Department}</h4>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <i className="fa fa-map-marker" />
                            &nbsp;
                            {location}
                            <br />
                            <i className="fa fa-phone" />
                            &nbsp;
                            {phoneNumber}
                            <br />
                            <a
                              href={`mailto:${emailAddress}?Subject=Hello%20again`}
                              target="_top"
                              style={{
                                padding: 0,
                                cursor: "pointer"
                              }}
                            >
                              <i className="fa fa-envelope" />
                              &nbsp;
                              {emailAddress}
                            </a>
                            <br />
                            {Address}
                            <br />
                            <div className="col-lg-12 no-pd">
                              <div className="doc-info d-plt pr-notes" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              });

              return (
                <div
                  className="col-xs-12 col-sm-12 enc-card"
                  key={index}
                  ref={(ref) => setArray(this.ChapterRefArray, index, ref)}
                  id={index}
                >
                  <div>
                    {this.chapterHead(states, index, imageSrc)}

                    {getArray(this.ChapterArray, index) ? (
                      <div>
                        {this.showAllMediaDataFromServer(index, states)}
                        <div
                          className="col-xs-12 no-pd chapter-text-data-layout"
                          style={{ display: "block" }}
                        >
                          <div className="pr-nt">
                            <div>{this.finalData}</div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            }
            return null;
          });
        }
        //main return function
        return (
          <div onClick={this.notificationClose}>
            <TopNav screenRecording={"notification"} />
            {this.state.mediaPlayer}
            {this.state.videoPopup}
            {this.state.cloudPopup}
            <section className="content-sec" id="section">
              <div className="container no-pd">
                <div className="row">
                  <div className="col-sm-12">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 no-pd lft-cnt">
                      {/* Patient Details */}
                      <PatientCard flag={this.flag} />

                      {/* for tabs */}
                      <div className="rec-encounter">
                        <div className="col-md-12 col-lg-12 col-sm-12 col-xs-12 p-tab">
                          <div className="no-pd p-filter">
                            <ul className="nav">
                              <li
                                className="active"
                                ref="encounter"
                                style={{ cursor: "pointer" }}
                              >
                                <a
                                  ref="#encounter"
                                  data-toggle="tab"
                                  name="encounter"
                                  onClick={this.navTabClick}
                                >
                                  Encounter
                                </a>
                              </li>
                              <li
                                ref="notification"
                                style={{ cursor: "pointer" }}
                              >
                                <a
                                  ref="#notification"
                                  data-toggle="tab"
                                  name="notification"
                                  onClick={this.navTabClick}
                                >
                                  Notification
                                </a>
                              </li>
                              <li ref="careteam" style={{ cursor: "pointer" }}>
                                <a
                                  ref="#care-team"
                                  data-toggle="tab"
                                  name="careteam"
                                  onClick={this.navTabClick}
                                >
                                  Care Team
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="tab-content">
                          {/* for encounters */}
                          {this.state.encounter ? (
                            <div
                              id="encounter"
                              className="tab-pane fade in active"
                            >
                              <div className="rec-enc-hd">
                                <h2
                                  className="hd-ttl"
                                  style={{ marginLeft: 4 }}
                                >
                                  Recent Encounter
                                </h2>
                                <Link
                                  to={{
                                    pathname: `/view_all/${
                                      this.props.match.params.id
                                    }`,
                                    state: {
                                      type: "View_all"
                                    }
                                  }}
                                  className="grd-ttl"
                                  style={{ marginTop: "0%", marginRight: "1%" }}
                                >
                                  View All
                                </Link>
                              </div>
                              <div className="col-xs-12 col-sm-12 no-pd rec-enc-wpr">
                                <div className="h-bor">
                                  <div
                                    className="col-xs-12 col-sm-12 enc-card no-bg no-pd no-mg"
                                    style={{ border: "none" }}
                                  >
                                    <div className="pr-tp-sec enc-info">
                                      <div className="col-md-6 col-lg-6 col-sm-8 col-xs-12 no-pd hos-data">
                                        <div className="prof-icon hos_img">
                                          <img
                                            src={this.icon}
                                            alt="Hospitalization"
                                            width="72%"
                                          />
                                        </div>
                                        <h2
                                          style={{
                                            textAlign: "left",
                                            marginBottom: 5
                                          }}
                                        >
                                          {this.encounter.appointment.title}
                                          <span className="dte">
                                            {this.date}
                                          </span>
                                        </h2>
                                        <h4>Visit # 985247316</h4>
                                      </div>
                                      <div className="doc-info doc-details col-md-4 col-lg-4 col-sm-4 col-xs-12 no-pd">
                                        <div className="d-txt">
                                          <p className="dr-n">
                                            <span className="dr-name">
                                              {this.encounter.appointment.name}
                                            </span>{" "}
                                            <span className="dept">
                                              {
                                                this.encounterPractitioner[0]
                                                  .specialty[0].coding[0]
                                                  .display
                                              }{" "}
                                              <br />{" "}
                                              {
                                                this.encounterPractitioner[0]
                                                  .specialty[0].coding[0].system
                                              }
                                            </span>
                                          </p>
                                        </div>
                                        <div
                                          className="prof-icon dr-img"
                                          style={{ marginTop: 2 }}
                                        >
                                          <img
                                            src={
                                              getImagePath(
                                                this.encounterPractitioner[0]
                                                  .photo.url
                                              ).imageUrl
                                            }
                                            alt="Dr.David Langer"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div
                                  className="h-content"
                                  style={{ borderTop: "1px solid #9E9E9E" }}
                                >
                                  <div className="col-xs-12 col-sm-12 spr" />
                                  {/* for showing chapters */}
                                  {providerChapter}
                                  {this.showchapters}
                                </div>
                              </div>
                            </div>
                          ) : null}

                          {/* for Notifications */}
                          {this.state.notification ? (
                            <PatientNotification />
                          ) : null}

                          {/* for Care team member */}
                          {this.state.careteam ? (
                            <CareTeam
                              id={this.props.match.params.id}
                              page="patient_details"
                            />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        );
      }
    }
  )
);
export default PatientDetails;
