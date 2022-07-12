import React, {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useHistory, useRouteMatch} from 'react-router';
import {Trans, t} from '@lingui/macro';
import PropTypes from 'prop-types';
import {Container, Icon, Button, Popup, Divider, Label} from 'semantic-ui-react';
import {useIsMobile} from 'src/util/hooks';
import {toggleGridView} from '../actions';
import {getGridViewActive, getStoredParticipantCodeForNewdle} from '../answerSelectors';
import {getUserInfo, getNumberOfParticipants} from '../selectors';
import styles from './NewdleTitle.module.scss';

export default function NewdleTitle({
  title,
  author,
  creatorUid,
  finished,
  code,
  url,
  isPrivate,
  isDeleted,
  limitedSlots,
}) {
  const userInfo = useSelector(getUserInfo);
  const participantCode = useSelector(state => getStoredParticipantCodeForNewdle(state, code));
  const isMobile = useIsMobile();
  const gridViewActive = useSelector(getGridViewActive);
  const hasParticipants = useSelector(getNumberOfParticipants) > 0;
  const history = useHistory();
  const dispatch = useDispatch();

  // TODO: Find a routing solution that doesn't push the same route to the history
  const isSummaryRoute = !!useRouteMatch({path: '/newdle/:code/summary'});
  const isEditing = !!useRouteMatch({path: '/newdle/:code/edit'});

  const summaryURL = `/newdle/${code}/summary`;
  const answerURL = `/newdle/${code}/${participantCode || ''}`;
  const isCreator = userInfo && userInfo.uid === creatorUid;

  // Disable grid view for mobile and
  // on the summary view with no participants
  useEffect(() => {
    if (gridViewActive && (isMobile || (isSummaryRoute && !hasParticipants))) {
      dispatch(toggleGridView());
    }
  }, [dispatch, gridViewActive, hasParticipants, isMobile, isSummaryRoute]);

  return (
    <Container text className={styles['box']}>
      <div className={styles['flexbox']}>
        <div>
          <div className={styles['title']}>
            <h1 className={styles['header']}>{title}</h1>
          </div>
          <div className={styles['subtitle']}>
            <div className={styles['author']}>
              <Trans>by {author}</Trans>
            </div>
            <div>
              {isPrivate && (
                <Popup
                  mouseEnterDelay={100}
                  trigger={<Label color="teal">private</Label>}
                  content={<Trans>Other participants' answers are hidden</Trans>}
                />
              )}
              {limitedSlots && (
                <Popup
                  mouseEnterDelay={100}
                  trigger={<Label color="orange">limited</Label>}
                  content={<Trans>You can only choose a single timeslot</Trans>}
                />
              )}
            </div>
          </div>
        </div>
        <div className={styles['view-options']}>
          {!isDeleted && (!isPrivate || isCreator) && (
            <Button.Group className={styles.navigation}>
              <Popup
                content={!finished ? t`Answer newdle` : t`This newdle has already finished`}
                position="bottom center"
                trigger={
                  <Button
                    icon
                    active={!isEditing && !isSummaryRoute}
                    // Prevent the same route from being pushed to the history again
                    onClick={() => (isSummaryRoute || isEditing ? history.push(answerURL) : null)}
                    disabled={finished}
                  >
                    <Icon name="calendar plus outline" />
                  </Button>
                }
              />
              <Popup
                content={t`View summary`}
                position="bottom center"
                trigger={
                  <Button
                    icon
                    active={isSummaryRoute}
                    onClick={() => (!isSummaryRoute ? history.push(summaryURL) : null)}
                  >
                    <Icon name="tasks" />
                  </Button>
                }
              />
            </Button.Group>
          )}
          {!isDeleted && (!isPrivate || isCreator || !isSummaryRoute) && !isMobile && (
            <Button.Group>
              <Popup
                content={t`Toggle grid view`}
                position="bottom center"
                trigger={
                  <Button
                    disabled={(!isSummaryRoute && finished) || (isSummaryRoute && !hasParticipants)}
                    toggle
                    icon
                    active={gridViewActive}
                    onClick={() => {
                      localStorage.setItem('prefersGridView', !gridViewActive);
                      dispatch(toggleGridView());
                    }}
                  >
                    <Icon name="th" />
                  </Button>
                }
              />
            </Button.Group>
          )}
        </div>
      </div>
      {(isCreator || participantCode) && !isDeleted && (
        <>
          <Divider fitted />
          <div className={styles['shareable-link']}>
            <div className={styles['legend']}>
              <Trans>Shareable link</Trans>
            </div>
            {navigator.clipboard ? (
              <Popup
                content={t`Copied!`}
                on="click"
                position="top center"
                inverted
                trigger={
                  <a
                    href={url}
                    title={t`Copy to clipboard`}
                    onClick={evt => {
                      navigator.clipboard.writeText(url);
                      evt.preventDefault();
                    }}
                  >
                    {url}
                  </a>
                }
              />
            ) : (
              url
            )}
          </div>
        </>
      )}
    </Container>
  );
}

NewdleTitle.propTypes = {
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  creatorUid: PropTypes.string.isRequired,
  label: PropTypes.string,
  finished: PropTypes.bool,
  code: PropTypes.string.isRequired,
  url: PropTypes.string,
  isPrivate: PropTypes.bool,
  isDeleted: PropTypes.bool,
  limitedSlots: PropTypes.bool,
};

NewdleTitle.defaultProps = {
  label: null,
  finished: null,
  isDeleted: false,
  isPrivate: true,
  url: null,
  limitedSlots: false,
};
